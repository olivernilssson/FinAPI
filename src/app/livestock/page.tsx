import { StockLive } from "@/lib/util/stock-live/stock-live"

export default function LiveStock() {
    return (
        <div className="content-container w-full">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StockLive ticker="AAPL" />
            </div>
        </div>
    )
}