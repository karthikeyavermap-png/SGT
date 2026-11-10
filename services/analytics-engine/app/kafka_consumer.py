import asyncio
import json
import logging
import os
from typing import Optional
from aiokafka import AIOKafkaConsumer
from app.data_store import data_store

logger = logging.getLogger("sgt.analytics.kafka")

class KafkaEventConsumer:
    def __init__(self):
        self.bootstrap_servers = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
        self.topics = [
            os.getenv("KAFKA_TOPIC_YARD", "sgt.yard.events"),
            os.getenv("KAFKA_TOPIC_TRANSPORT", "sgt.transport.events"),
            os.getenv("KAFKA_TOPIC_COMMERCIAL", "sgt.commercial.events"),
        ]
        self.group_id = os.getenv("KAFKA_GROUP_ID", "sgt-analytics-group")
        self.consumer: Optional[AIOKafkaConsumer] = None
        self._running = False
        self._task: Optional[asyncio.Task] = None

    async def start(self):
        self._running = True
        self._task = asyncio.create_task(self._consume_loop())
        logger.info(f"Kafka consumer scheduled for topics {self.topics} on {self.bootstrap_servers}")

    async def stop(self):
        self._running = False
        if self.consumer:
            try:
                await self.consumer.stop()
            except Exception as e:
                logger.warning(f"Error closing Kafka consumer: {e}")
        if self._task:
            self._task.cancel()

    async def _consume_loop(self):
        retry_delay = 5
        while self._running:
            try:
                logger.info(f"Connecting to Kafka at {self.bootstrap_servers}...")
                self.consumer = AIOKafkaConsumer(
                    *self.topics,
                    bootstrap_servers=self.bootstrap_servers,
                    group_id=self.group_id,
                    value_deserializer=lambda v: json.loads(v.decode("utf-8")),
                    auto_offset_reset="earliest",
                    enable_auto_commit=True,
                )
                await self.consumer.start()
                logger.info(f"Successfully subscribed to Kafka topics: {self.topics}")

                async for msg in self.consumer:
                    if not self._running:
                        break
                    topic = msg.topic
                    event_data = msg.value
                    logger.info(f"Received event on topic {topic}: {event_data.get('eventType', 'UNKNOWN')}")
                    data_store.record_event(topic, event_data)

            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.warning(
                    f"Kafka broker connection failed ({e}). Analytics engine running in fallback/standalone mode. Retrying in {retry_delay}s..."
                )
                if self.consumer:
                    try:
                        await self.consumer.stop()
                    except Exception:
                        pass
                    self.consumer = None
                await asyncio.sleep(retry_delay)
                retry_delay = min(retry_delay * 2, 60)

kafka_consumer = KafkaEventConsumer()

