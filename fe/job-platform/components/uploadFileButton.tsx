"use client";

import { useMutation } from "@tanstack/react-query";
import { useRef, useState, type ChangeEvent } from "react";
import { CircleCheckBig, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

type SelectedFile = {
  id: string;
  file: File;
};

export type UploadedFileItem = {
  id: string;
  fileName: string;
};

type UploadStatus = {
  tone: "neutral" | "success" | "error";
  message: string;
};

export type FileUploadPayload = {
  file: File;
  userId: string;
  token: string;
};

export type FileUploadResult = {
  fileName: string;
};

type UploadFileButtonProps = {
  acceptedFileTypes: string[];
  acceptedFileExtensions?: string;
  userId?: string;
  token?: string;
  historyFiles?: UploadedFileItem[];
  isHistoryLoading?: boolean;
  uploadFn: (payload: FileUploadPayload) => Promise<FileUploadResult>;
  onUploadSuccess?: (result: FileUploadResult) => void;
};

export function UploadFileButton({
  userId,
  token,
  acceptedFileTypes,
  acceptedFileExtensions = ".pdf,.docx",
  uploadFn,
  onUploadSuccess,
  historyFiles = [],
  isHistoryLoading = false,
}: UploadFileButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<UploadStatus | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);

  const uploadMutation = useMutation({
    mutationFn: uploadFn,
    onSuccess: (result) => {
      setSelectedFiles([]);
      setStatus({
        tone: "success",
        message: `${result.fileName} uploaded successfully.`,
      });
      onUploadSuccess?.(result);
    },
    onError: () => {
      setStatus({
        tone: "error",
        message: "Resume upload failed. Please try again.",
      });
    },
  });

  const accept = `${acceptedFileExtensions},${acceptedFileTypes.join(",")}`;
  const isUploading = uploadMutation.isPending;

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const removeSelectedFile = (fileId: string) => {
    setSelectedFiles((prev) => prev.filter((item) => item.id !== fileId));
    setStatus(null);
  };

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!acceptedFileTypes.includes(file.type)) {
      setStatus({
        tone: "error",
        message: "Please choose a valid file type.",
      });
      return;
    }

    setStatus(null);
    setSelectedFiles([{ id: crypto.randomUUID(), file }]);
  };

  const submitFile = (selectedFile: SelectedFile) => {
    if (!userId || !token) {
      setStatus({
        tone: "error",
        message: "Please log in again before uploading your resume.",
      });
      return;
    }

    setStatus({ tone: "neutral", message: "Uploading resume..." });
    uploadMutation.mutate({
      file: selectedFile.file,
      userId,
      token,
    });
  };

  const selectedFileItems = selectedFiles.map((item) => (
    <Item key={item.id} variant="outline">
      <ItemMedia variant="icon">
        <CircleCheckBig className="text-gray-500" />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>New file</ItemTitle>
        <ItemDescription>{item.file.name}</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="border-0 text-red-500 hover:bg-red-50 hover:text-red-500"
          disabled={isUploading}
          hidden={isUploading}
          onClick={() => removeSelectedFile(item.id)}
        >
          Remove
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="border-0 text-green-600 hover:bg-green-50 hover:text-green-600"
          disabled={isUploading}
          hidden={status?.tone === "error"}
          onClick={() => submitFile(item)}
        >
          {isUploading ? "Submitting..." : "Submit"}
        </Button>
      </ItemActions>
    </Item>
  ));

  const historyFileItems = historyFiles.map((item) => (
    <Item key={item.id} variant="outline">
      <ItemMedia variant="icon">
        <CircleCheckBig className="text-green-500" />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Uploaded resume</ItemTitle>
        <ItemDescription>{item.fileName}</ItemDescription>
      </ItemContent>
    </Item>
  ));

  return (
    <div className="flex flex-col items-start gap-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Upload className="size-4" />
            Resume
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Resume</DialogTitle>
            <DialogDescription>
              Upload your resume to get started.
            </DialogDescription>
          </DialogHeader>

          {(selectedFiles.length > 0 || status?.tone === "success") && (
            <div className="space-y-3">
              {selectedFileItems}
              {status && (
                <p
                  className={
                    status.tone === "error"
                      ? "text-xs italic text-red-400"
                      : status.tone === "success"
                        ? "text-xs italic text-green-600"
                        : "text-xs italic text-slate-500"
                  }
                >
                  {status.message}
                </p>
              )}
            </div>
          )}

          {selectedFiles.length === 0 && (
            <Empty className="border border-dashed">
              <EmptyHeader>
                <EmptyTitle>{`${!historyFiles.length ? "Nothing Uploaded" : "Upload New"}`}</EmptyTitle>
                <EmptyDescription>
                  We will not store your resume file. It will be processed to
                  extract the key information.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept={accept}
                  className="hidden"
                  onChange={handleUpload}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={openFilePicker}
                >
                  <Upload className="size-4" />
                  Upload
                </Button>
              </EmptyContent>
            </Empty>
          )}
          <Separator />
          {isHistoryLoading && (
            <div className="flex w-full max-w-xs items-center justify-between gap-4">
              <div className="grid gap-2">
                <Skeleton className="h-4 w-70" />
                <Skeleton className="h-4 w-70" />
              </div>
              <Skeleton className="h-8 w-15 shrink-0 rounded-xl" />
              <Skeleton className="h-8 w-15 shrink-0 rounded-xl" />
            </div>
          )}
          {!isHistoryLoading && historyFiles.length > 0 && (
            <div className="space-y-3">{historyFileItems}</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
