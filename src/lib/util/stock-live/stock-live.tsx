"use client";

import { Card, Metric, Text } from '@tremor/react';

import { useEffect, useState } from 'react';
import protobuf, { Root, Message } from 'protobufjs';
const { Buffer } = require('buffer/');

function formatPrice(price: number) {
    return `$${price.toFixed(2)}`;
}

export function StockLive() {
    const [stock, setStock] = useState<Message<{}> | null>(null);
    useEffect(() => {
        const ws = new WebSocket('wss://streamer.finance.yahoo.com');
        protobuf.load('./YPricingData.proto', (error: Error | null, root: Root | undefined) => {
            if (error) {
                console.log(error);
                return;
            }

            const Yaticker = root?.lookupType('yaticker');
            
            ws.onopen = function open() {
                console.log('connected');
                ws.send(JSON.stringify({ subscribe: ['TSLA'] }));
            };
        
            ws.onclose = function close() {
                console.log('disconnected');
            };
        
            ws.onmessage = function incoming(message) {
                try {
                    const next = Yaticker?.decode(new Buffer(message.data, 'base64'));
                    if (next) {
                        setStock(next);
                    }
                } catch (error) {
                    console.error('Error decoding message:', error);
                }
            };
        });
    }, []);
    return (
        <div>
            <div className="w-full">
            <Card
                className="w-full"
                decoration="top"
                decorationColor="indigo"
            >
                <p className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">{stock && (stock as any).id}</p>
                <p className="text-3xl text-tremor-content-strong dark:text-dark-tremor-content-strong font-semibold">{stock && formatPrice((stock as any).price)}</p>
                </Card>
            </div>

        </div>
    )
}
