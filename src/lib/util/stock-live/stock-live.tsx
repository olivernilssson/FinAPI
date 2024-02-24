"use client";

import { Card, Metric, Text } from '@tremor/react';

import { useEffect, useState } from 'react';
import protobuf, { Root, Message } from 'protobufjs';
const { Buffer } = require('buffer/');

function formatPrice(price: number) {
    return `$${price.toFixed(2)}`;
}

export function StockLive({ ticker }: { ticker: string }) {
    const [prevStock, setPrevStock] = useState<Message<{}> | null | undefined>(null);
    const [currentStock, setCurrentStock] = useState<Message<{}> | null | undefined>(null);
    const [direction, setDirection] = useState('up');
    const [connect, setConnect] = useState(false);
    const [marketStatus, setMarketStatus] = useState('loading');

    useEffect(() => {
        const ws = new WebSocket('wss://streamer.finance.yahoo.com');
        protobuf.load('./YPricingData.proto', (error: Error | null, root: Root | undefined) => {
            if (error) {
                console.log(error);
                return;
            }

            let timeout: NodeJS.Timeout;
            const setMarketClosed = () => {
                timeout = setTimeout(() => {
                    console.log('Market Closed');
                    setMarketStatus('closed');
                }, 3000);
            }

            setMarketClosed();

            const Yaticker = root?.lookupType('yaticker');
            
            ws.onopen = function open() {
                setConnect(true);
                console.log('connected');
                // clearTimeout(timeout);
                ws.send(JSON.stringify({ subscribe: [ticker] }));
            };
        
            ws.onclose = function close() {
                setConnect(false);
                console.log('disconnected');
            };
        
            ws.onmessage = async function incoming(message) {
                setMarketStatus('open');
                clearTimeout(timeout);

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
                decorationColor={priceColor}
                >
                <div className='flex justify-between align-center'>
                    <h1 className="text-tremor-content dark:text-dark-tremor-content text-3xl font-b">{ticker}</h1>
                    <div className="flex-col text-right">
                        {connect ? <p className="text-green-500">Connected</p> : <p className="text-slate-400">Connecting...</p>}
                        {marketStatus === 'closed' ? (<p className="text-red-500">Market Closed</p>) : marketStatus === 'open' ? <p className="text-green-500">Market Open</p> : <p className="text-slate-400">Checking market status...</p>}
                    </div>
                </div>
                <p className={`text-3xl font-semibold ${priceColor}`}>{currentStock && formatPrice((currentStock as any).price)}</p>
                </Card>
            </div>

        </div>
    )
}
