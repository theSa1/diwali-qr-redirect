"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const Page = () => {
  const [code, setCode] = useState("");
  const router = useRouter();

  const login = async () => {
    const tId = toast.loading("Authenticating...");
    try {
      const res = await fetch("/api/authenticate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: code }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Authentication failed");
      }

      toast.success("Authenticated successfully", { id: tId });
      router.push("/");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An error occurred",
        { id: tId }
      );
    }
  };

  return (
    <div className="p-5 mx-auto max-w-2xl flex items-center justify-center h-svh flex-col gap-5">
      <h1 className="text-2xl font-bold">Authenticate</h1>
      <Card>
        <CardContent>
          <InputOTP maxLength={4} value={code} onChange={(v) => setCode(v)}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={1} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
            </InputOTPGroup>
          </InputOTP>
          <Button className="mt-5 w-full" onClick={login}>
            Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
