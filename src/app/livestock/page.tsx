"use client"

import { useState } from 'react';
import { StockLive } from "@/lib/util/stock-live/stock-live"
import { TextInput, Button } from "@tremor/react";
import { RiSearchLine } from '@remixicon/react';

export default function LiveStock() {
    const [ticker, setTicker] = useState('');
    const [tickers, setTickers] = useState(['BTC-USD', '^GSPC', '^OMX']);

    const addTicker = () => {
        setTickers([...tickers, ticker]);
        setTicker('');
    }

    const addDisabled = ticker.length == 0;
    const clearDisabled = tickers.length == 0;

    return (
        <div className="content-container w-full space-y-10">
            <div className='flex gap-3'>
                <TextInput icon={RiSearchLine} placeholder="Search..." onValueChange={(value) => setTicker(value.toUpperCase())} value={ticker} onKeyDown={(event) => event.key === 'Enter' && addTicker()} />
                <Button onClick={() => setTickers([])} disabled={clearDisabled} color='red'>Clear Tickers</Button>
                <Button onClick={addTicker} disabled={addDisabled} color='green'>Add Ticker</Button>
            </div>
            <h1 className="text-tremor-content dark:text-dark-tremor-content text-3xl font-b">{ticker}</h1>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {tickers.map((ticker, index) => (
                    <StockLive key={index} ticker={ticker} />
                ))}
            </div>
        </div>
    )
}