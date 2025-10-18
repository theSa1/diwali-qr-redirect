"use client";
import { ConfirmDelete } from "@/components/confirm-delete";
import { ConfirmSetRedirect } from "@/components/confirm-set-redirect";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Trash2, Video } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function Home() {
  const [presets, setPresets] = useState<
    {
      link: string;
      ogImage: string;
      title: string;
    }[]
  >([]);
  const STORAGE_KEY = "divali_presets_v1";

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const valid = parsed.filter(
          (p) =>
            p &&
            typeof p.link === "string" &&
            typeof p.ogImage === "string" &&
            typeof p.title === "string"
        );
        if (valid.length) setPresets(valid);
      }
    } catch (err) {
      toast.error("Failed to load presets from localStorage");
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
    } catch (err) {
      toast.error("Failed to save presets to localStorage");
    }
  }, [presets]);

  const fetchPreset = async (link: string) => {
    if (presets.find((p) => p.link === link)) {
      toast.error("Preset already exists for this link");
      return;
    }
    const tId = toast.loading("Fetching Open Graph data...");
    try {
      const response = await fetch(
        `/api/get-og-data?url=${encodeURIComponent(link)}`
      );
      const data = (await response.json()) as
        | {
            title: string;
            ogImage: string;
          }
        | {
            error: string;
          };
      if (response.ok && !("error" in data)) {
        setPresets((prev) => [
          ...prev,
          { link, ogImage: data.ogImage, title: data.title },
        ]);
        toast.success("Fetched OG data successfully!", { id: tId });
      } else {
        toast.error("error" in data ? data.error : "Failed to fetch OG data", {
          id: tId,
        });
      }
    } catch (error) {
      console.error("Error fetching OG data:", error);
    }
  };

  const setRedirect = async (link: string) => {
    const tId = toast.loading("Setting redirect...");
    try {
      const res = await fetch("/api/set-redirect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ link }),
      });
      const data = (await res.json()) as { success: boolean; error?: string };
      if (!res.ok || !data.success) {
        if (data.error) {
          toast.error(data.error, { id: tId });
        } else {
          toast.error("Failed to set redirect", { id: tId });
        }
      } else {
        toast.success("Redirect set successfully!", { id: tId });
      }
    } catch (error) {
      console.error("Error setting redirect:", error);
      toast.error("An unexpected error occurred", { id: tId });
    }
  };

  return (
    <div className="max-w-xl mx-auto p-5">
      <h1 className="text-2xl font-bold mb-5 text-center">
        Rangoli QR Controller
      </h1>
      <div className="grid grid-cols-2 gap-5">
        {presets.map((preset, i) => (
          <div
            className={cn(
              "group relative overflow-hidden rounded-xl bg-muted/40",
              "cursor-pointer transition-all duration-200",
              "hover:shadow-lg",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "aspect-[3/4]"
            )}
            role="button"
            tabIndex={0}
            key={preset.link}
          >
            <ConfirmDelete
              onConfirm={() => {
                setPresets((prev) => prev.filter((p, ix) => i !== ix));
                toast.success("Preset deleted");
              }}
            >
              <Button
                className="absolute top-2 right-2 z-20"
                size="icon"
                variant="destructive"
              >
                <Trash2 />
              </Button>
            </ConfirmDelete>
            <ConfirmSetRedirect onConfirm={() => setRedirect(preset.link)}>
              <img
                alt={preset.title}
                className={cn(
                  "absolute inset-0 h-full w-full object-cover",
                  "transition-opacity duration-200",
                  "group-hover:opacity-90"
                )}
                src={preset.ogImage}
              />
            </ConfirmSetRedirect>
            <div
              className={cn(
                "absolute right-0 left-0 h-10 from-black/75 to-transparent",
                "bottom-0 bg-gradient-to-t"
              )}
            />
            <div
              className={cn(
                "absolute bottom-0 right-0 left-0 z-10 truncate",
                "p-3 text-white"
              )}
            >
              {preset.title}
            </div>
          </div>
        ))}
      </div>

      {presets.length === 0 && (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Video />
            </EmptyMedia>
            <EmptyTitle>No Presets</EmptyTitle>
            <EmptyDescription>No presets have been added yet.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const link = (
            e.currentTarget.elements.namedItem("link") as HTMLInputElement
          ).value;
          fetchPreset(link);
          e.currentTarget.reset();
        }}
        className="mt-8 space-y-4"
      >
        <div className="flex gap-3">
          <Input placeholder="Enter URL to add preset" name="link" required />
          <Button type="submit">Add URL</Button>
        </div>
      </form>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const link = (
            e.currentTarget.elements.namedItem("link") as HTMLInputElement
          ).value;
          setRedirect(link);
          e.currentTarget.reset();
        }}
        className="mt-5 space-y-4"
      >
        <div className="flex gap-3">
          <Input placeholder="Enter Custom Redirect URL" name="link" required />
          <Button type="submit">Set Redirect URL</Button>
        </div>
      </form>
    </div>
  );
}
