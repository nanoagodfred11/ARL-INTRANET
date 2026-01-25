/**
 * Gold Price Widget
 * Displays live gold price with chart using TradingView widget
 */

import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/react";
import { DollarSign } from "lucide-react";

export function GoldPriceWidget() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <Card className="shadow-sm h-full bg-gradient-to-br from-amber-50 to-yellow-50">
      <CardHeader className="flex items-center gap-2 pb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-amber-500">
          <DollarSign size={20} className="text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Gold Price</h3>
          <p className="text-xs text-gray-500">XAU/USD Live Market</p>
        </div>
      </CardHeader>
      <CardBody className="pt-0">
        {/* Mini Chart with Price */}
        {isClient && (
          <iframe
            src="https://www.tradingview-widget.com/embed-widget/mini-symbol-overview/?locale=en#%7B%22symbol%22%3A%22OANDA%3AXAUUSD%22%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22280%22%2C%22dateRange%22%3A%221D%22%2C%22colorTheme%22%3A%22light%22%2C%22isTransparent%22%3Atrue%2C%22autosize%22%3Afalse%2C%22largeChartUrl%22%3A%22%22%7D"
            style={{ width: "100%", height: "280px", border: "none" }}
            title="Gold Price Chart"
          />
        )}

        <p className="text-xs text-gray-400 text-center mt-2">
          Live data from TradingView
        </p>
      </CardBody>
    </Card>
  );
}
