"use client";

import { Card, Metric, Text } from '@tremor/react';

import { useEffect, useState } from 'react';
import protobuf, { Root, Message } from 'protobufjs';
const { Buffer } = require('buffer/');

function formatPrice(price: number) {
    return `$${price.toFixed(2)}`;
}

export function StockLive() {
    const [prevStock, setPrevStock] = useState<Message<{}> | null | undefined>(null);
    const [currentStock, setCurrentStock] = useState<Message<{}> | null | undefined>(null);
    const [direction, setDirection] = useState('up');
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
                ws.send(JSON.stringify({ subscribe: ['AAPL'] }));
            };
        
            ws.onclose = function close() {
                console.log('disconnected');
            };
        
            ws.onmessage = async function incoming(message) {

                const next = Yaticker?.decode(new Buffer(message.data, 'base64'));
                setCurrentStock((current) => {
                    setPrevStock(current);
                    return next;
                }
                );
            };
        });
    }, []);

    useEffect(() => {
        if (currentStock && prevStock) {
            const nextPrice = (currentStock as any).price.toFixed(2);
            const prevPrice = (prevStock as any).price.toFixed(2);

            const newDirection = prevPrice < nextPrice ? 'up' : 'down';
            if (nextPrice !== prevPrice) {
                setDirection(newDirection);
            }
        }
    }, [currentStock, prevStock]);
    

    const priceColor = {
        up: 'text-green-500',
        down: 'text-red-500',
    }[direction];
    

    return (
        <div>
            <div className="w-full">
            <Card
                className="w-full"
                decoration="top"
                decorationColor="indigo"
            >
                <p className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">{currentStock && (currentStock as any).id}</p>
                    <p className={`text-3xl font-semibold ${priceColor}`}>{currentStock && formatPrice((currentStock as any).price)}</p>
                </Card>
            </div>

        </div>
    )
}
