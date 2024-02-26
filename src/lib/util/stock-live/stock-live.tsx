"use client";

import { Card, Badge } from '@tremor/react';
import { RiRecordCircleFill, RiDonutChartLine } from '@remixicon/react';
import { useEffect, useState } from 'react';
import protobuf, { Root, Message } from 'protobufjs';
const { Buffer } = require('buffer/');

function formatPrice(price: number) {
    return price.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
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
                }, 30000);
            }

            setMarketClosed();

            const Yaticker = root?.lookupType('yaticker');
            
            ws.onopen = function open() {
                setConnect(true);
                console.log('connected');
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
    
    const decorationColor = priceColor?.substring(5);

    return (
        <div>
            <div className="w-full">
            <Card
                className="w-full"
                decoration="top"
                decorationColor={decorationColor}
                >
                <div className='flex justify-between align-center'>
                    <h1 className="text-tremor-content dark:text-dark-tremor-content text-3xl font-b">{ticker}</h1>
                    <div className="flex-col text-right">
                        {connect ? 
                            <Badge color={'green'}>
                                <div className='flex items-center justify-between gap-x-2'>
                                    <span className='animate-pulse'>
                                        <RiRecordCircleFill />
                                    </span>
                                    <span>Connected</span>
                                </div>
                            </Badge> 
                        : 
                            <Badge>
                                <div className='flex items-center justify-between'>
                                    <span className='animate-pulse'>
                                        <RiRecordCircleFill />
                                    </span>
                                    <span>Connecting...</span>
                                </div>
                            </Badge>
                            }
                            {marketStatus === 'closed' ? (<p className="text-red-500">Market Closed</p>) : marketStatus === 'open' ? <p className="text-green-500">Market Open</p> :
                                <div className='flex items-center justify-between gap-x-2'>
                                    <span className='animate-spin'>
                                        <RiDonutChartLine />
                                    </span>
                                    <span>Checking market status</span>
                                </div>}
                    </div>
                </div>
                <p className={`text-3xl font-semibold ${priceColor}`}>{currentStock && formatPrice((currentStock as any).price)}</p>
                </Card>
            </div>

        </div>
    )
}
