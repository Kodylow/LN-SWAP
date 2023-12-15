"use client";

import Container from "@/components/container";
import {
  WebLNProvider,
  useWebLNContext,
} from "@/components/providers/webln-provider";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import Swap from "./swap";

function Fallback() {
  const { isLoading, error } = useWebLNContext();

  if (isLoading) {
    return (
      <Container center>
        <Icon
          icon="IconLoader2"
          size="xl"
          className="animate-load text-lightGrey"
        />
        <Text>Initializing WebLN...</Text>
      </Container>
    );
  }

  if (error) {
    return (
      <Container center>
        <Text variant="h2" weight="bold" className="text-center">
          WebLN Provider Required
        </Text>
        <Text className="text-center">
          A WebLN Provider is required in order to run this application.{" "}
        </Text>
        <Button onClick={() => window.location.reload()}>Reload</Button>
      </Container>
    );
  }

  return (
    <Container className="h-full items-stretch p-md grow">
      <Swap />
    </Container>
  );
}

export default function Index() {
  return (
    <WebLNProvider>
      <Fallback />
    </WebLNProvider>
  );
}
