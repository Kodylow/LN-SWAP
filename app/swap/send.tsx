import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Rate } from ".";
import { useToast } from "@/components/ui/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Token } from "@/lib/constants";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { Dialog } from "@/components/ui/dialog";
import Scanner from "@/components/ui/scanner";

const FormSchema = z.object({
  amount: z.number().min(0),
  address: z.string(),
});

export default function Send({
  rate,
  setOrder,
  token,
}: {
  rate?: Rate;
  setOrder: Dispatch<SetStateAction<{ token: string; id: string } | null>>;
  token: Token;
}) {
  const [scanning, setScanning] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      amount: (rate?.from.min || 0) * 100000000,
      address: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (fields: z.infer<typeof FormSchema>) => {
      const { data, error } = await fetch("/api/send", {
        method: "POST",
        body: JSON.stringify({
          to: token,
          amount: fields.amount / 100000000,
          address: fields.address,
        }),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }).then((r) => r.json());

      if (error) {
        toast({
          content: error,
          duration: 2500,
        });

        return;
      }

      if (data?.id) {
        setOrder({
          id: data.id,
          token: data.token,
        });
      }

      if (typeof window.webln !== "undefined") {
        await window.webln.enable();
        try {
          const { preimage } = await window.webln.sendPayment(data.invoice);

          if (preimage) {
            toast({
              content: "Payment sent",
              duration: 2500,
            });
          } else {
            toast({
              content: "The payment failed to go through",
              duration: 2500,
            });
          }
        } catch (err) {
          toast({
            content: (err as any).message,
            duration: 2500,
          });
        }
      }
    },
  });

  useEffect(() => {
    if (rate?.from.min && typeof rate.from.min === "number") {
      form.setValue("amount", Math.round(rate?.from.min * 100000000));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rate?.from.min]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
        className="flex flex-col gap-4 w-full grow items-stretch grow"
      >
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount (Sats)</FormLabel>
              <Input
                value={String(field.value)}
                onChange={(e) => field.onChange(Number(e.target.value))}
                placeholder="69420"
                min={(rate?.from.min || 0) * 100000000}
                max={(rate?.from.max || 0) * 100000000}
                type="number"
                step="any"
              />
              <Text variant="small" className="text-grey">
                + Swap Fee: {Math.round(field.value / 100)} sats
              </Text>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <div className="flex gap-sm">
                <Button
                  className="!p-sm rounded-sm w-xxl shrink-0 rounded-lg !border !border-lightGrey"
                  variant="outline"
                  type="button"
                  onClick={() => setScanning(true)}
                >
                  <Icon icon="IconQrcode" className="w-xl h-xl" />
                </Button>
                <Input
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder="0xAb5801a7D398351b8bE11C439..."
                />
              </div>
              <Dialog
                open={scanning}
                onOpenChange={setScanning}
                title="Scan Address"
              >
                <Scanner
                  scanning={scanning}
                  onResult={(res) => {
                    field.onChange(res);
                    setScanning(false);
                  }}
                  onError={console.log}
                />
              </Dialog>
            </FormItem>
          )}
        />

        <div className="grow" />

        <Button type="submit" loading={mutation.status === "pending"}>
          Submit
        </Button>
      </form>
    </Form>
  );
}
