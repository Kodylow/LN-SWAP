import { useEffect, useState } from "react";
import Send from "./send";
import Receive from "./receive";
import { Shitcoin, shitcoins } from "@/lib/constants";
import { Status, statuses } from "../types";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import Image from "next/image";

export interface RateInfo {
  code: Shitcoin;
  rate: number;
  min: number;
  max: number;
}

export interface Rate {
  from: RateInfo;
  to: RateInfo;
}

export default function Swap() {
  const [tab, setTab] = useState<"send" | "receive">("send");
  const [shitcoin, setShitcoin] = useState<Shitcoin>(shitcoins[0].code);
  const [order, setOrder] = useState<{
    token: string;
    id: string;
  } | null>(null);
  const [status, setStatus] = useState(Status.NEW);

  const { data } = useQuery<Rate>({
    queryKey: ["prices", { tab, shitcoin }],
    queryFn: async () => {
      const res = await fetch(
        `/api/rate?from=${tab === "send" ? "BTC" : shitcoin}&to=${
          tab === "send" ? shitcoin : "BTC"
        }`,
      )
        .then((r) => r.json())
        .catch((err) => {
          throw new Error(err);
        });

      if (!res) {
        throw new Error("Could not fetch rates from fixedfloat.");
      }

      if (res.error) {
        throw new Error(res.error);
      }

      return res.data;
    },
    refetchInterval: 10000,
  });

  useEffect(() => {
    if (order) {
      const pollInterval = setInterval(() => {
        if (status === Status.DONE || status === Status.EMERGENCY) {
          clearInterval(pollInterval);
          return;
        }

        fetch(`/api/status?id=${order.id}&token=${order.token}`)
          .then((r) => r.json())
          .then((res) => {
            if (res?.data?.status) {
              setStatus(Status[res.data.status as keyof typeof Status]);
            }
          });
      }, 5000);

      return () => {
        clearInterval(pollInterval);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order]);

  return (
    <div className="flex flex-col gap-sm items-center">
      <div className="flex w-full bg-extraLightGrey rounded-lg p-xs">
        <button
          className={`grow basis-0 rounded-md text-base px-md py-sm ${
            tab === "send" ? "bg-white" : ""
          }`}
          onClick={() => setTab("send")}
        >
          Send ⚡️
        </button>
        <button
          className={`grow basis-0 rounded-md text-base px-md py-sm ${
            tab === "receive" ? "bg-white" : ""
          }`}
          onClick={() => setTab("receive")}
        >
          Receive ⚡️
        </button>
      </div>

      <div className="flex gap-sm flex-col w-full">
        <Label htmlFor="shitcoin">Shitcoin / Cryptocurrency (same thing)</Label>
        <Select
          onValueChange={(value) => setShitcoin(value as Shitcoin)}
          defaultValue={shitcoin}
        >
          <SelectTrigger id="shitcoin">
            <SelectValue placeholder="Select cryptocurrency" />
          </SelectTrigger>
          <SelectContent className="flex flex-col">
            {shitcoins.map((coin, i) => (
              <SelectItem
                key={i}
                value={coin.code}
                className="flex grow w-full"
              >
                <div className="flex gap-2 items-center w-full grow">
                  <Image
                    src={coin.logo}
                    width={16}
                    height={16}
                    alt={coin.name + " Logo"}
                    className="rounded"
                  />
                  <Text className="grow w-full">{coin.name}</Text>
                  <Text className="flex gap-1 items-center" variant="small">
                    <Icon icon="IconGlobe" />
                    {coin.network}
                  </Text>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {tab === "send" ? (
        <Send rate={data} setOrder={setOrder} shitcoin={shitcoin} />
      ) : (
        <Receive rate={data} setOrder={setOrder} shitcoin={shitcoin} />
      )}

      {order ? (
        <div className="flex flex-col gap-2 justify-center mt-8 w-full">
          <span className="font-bold text-md text-center">
            Progress: {statuses.find((x) => x.type === status)?.type}
          </span>
          <div className="w-full h-sm rounded-full bg-extraLightGrey relative">
            <div
              className="absolute top-0 left-0 h-full bg-darkGrey rounded-full"
              style={{
                width: `${
                  status === Status.EMERGENCY
                    ? 100
                    : (statuses.findIndex((x) => x.type === status) /
                        (statuses.length - 3)) *
                      100
                }%`,
              }}
            ></div>
          </div>
          <span className="text-muted-foreground text-sm text-center">
            {statuses.find((x) => x.type === status)?.description}
          </span>
        </div>
      ) : null}
    </div>
  );
}
