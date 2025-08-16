import { useState, useRef, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, File, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface FileUploadProps {
  onUpload: (url: string) => void;
  accept?: string;
  maxSize?: number; // in bytes
  multiple?: boolean;
  children?: ReactNode;
  className?: string;
}

export default function FileUpload({
  onUpload,
  accept = "*/*",
  maxSize = 10 * 1024 * 1024, // 10MB default
  multiple = false,
  children,
  className = "",
}: FileUploadProps) {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const validateFile = (file: File): boolean => {
    if (file.size > maxSize) {
      setErrorMessage(`File size exceeds ${formatFileSize(maxSize)} limit`);
      return false;
    }

    // Validate file type if accept pattern is specified
    if (accept !== "*/*") {
      const acceptedTypes = accept.split(",").map(type => type.trim());
      const fileType = file.type;
      const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();

      const isValidType = acceptedTypes.some(acceptedType => {
        if (acceptedType.startsWith(".")) {
          return acceptedType === fileExtension;
        }
        if (acceptedType.includes("*")) {
          const [mainType] = acceptedType.split("/");
          return fileType.startsWith(mainType);
        }
        return acceptedType === fileType;
      });

      if (!isValidType) {
        setErrorMessage(`File type not supported. Accepted types: ${accept}`);
        return false;
      }
    }

    return true;
  };

  const simulateUpload = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Simulate upload progress
      setUploadStatus("uploading");
      setUploadProgress(0);

      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev === null) return 10;
          if (prev >= 90) {
            clearInterval(interval);
            // Simulate final upload completion
            setTimeout(() => {
              setUploadProgress(100);
              setTimeout(() => {
                setUploadStatus("success");
                // Return a mock URL - in real implementation, this would be the actual uploaded file URL
                const mockUrl = URL.createObjectURL(file);
                resolve(mockUrl);
              }, 500);
            }, 200);
            return 100;
          }
          return prev + Math.random() * 15;
        });
      }, 100);

      // Simulate occasional upload failure
      if (Math.random() < 0.1) { // 10% chance of failure for demo
        setTimeout(() => {
          clearInterval(interval);
          setUploadStatus("error");
          setErrorMessage("Upload failed. Please try again.");
          reject(new Error("Upload failed"));
        }, 2000);
      }
    });
  };

  const handleFiles = async (files: FileList) => {
    setErrorMessage("");
    setUploadStatus("idle");

    const fileArray = Array.from(files);
    
    if (!multiple && fileArray.length > 1) {
      setErrorMessage("Please select only one file");
      return;
    }

    for (const file of fileArray) {
      if (!validateFile(file)) {
        setUploadStatus("error");
        return;
      }

      try {
        const url = await simulateUpload(file);
        onUpload(url);
        toast({
          title: "Upload successful",
          description: `${file.name} has been uploaded successfully`,
        });
      } catch (error) {
        setUploadStatus("error");
        toast({
          title: "Upload failed",
          description: "There was an error uploading your file",
          variant: "destructive",
        });
      }
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const resetUpload = () => {
    setUploadStatus("idle");
    setUploadProgress(null);
    setErrorMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (children) {
    return (
      <>
        <div onClick={handleClick} className={className}>
          {children}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInputChange}
          className="hidden"
        />
        
        {uploadStatus === "uploading" && uploadProgress !== null && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Uploading...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {uploadStatus === "error" && errorMessage && (
          <Alert className="mt-4" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
      </>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer
          ${isDragging 
            ? "border-lautech-blue bg-blue-50" 
            : "border-gray-300 hover:border-gray-400"
          }
          ${uploadStatus === "error" ? "border-red-300 bg-red-50" : ""}
          ${uploadStatus === "success" ? "border-green-300 bg-green-50" : ""}
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="text-center">
          {uploadStatus === "uploading" ? (
            <div className="space-y-2">
              <Upload className="mx-auto h-8 w-8 text-lautech-blue animate-pulse" />
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          ) : uploadStatus === "success" ? (
            <div className="space-y-2">
              <CheckCircle className="mx-auto h-8 w-8 text-green-600" />
              <p className="text-sm text-green-600">Upload successful!</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  resetUpload();
                }}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Upload another file
              </button>
            </div>
          ) : uploadStatus === "error" ? (
            <div className="space-y-2">
              <XCircle className="mx-auto h-8 w-8 text-red-600" />
              <p className="text-sm text-red-600">Upload failed</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  resetUpload();
                }}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Try again
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="mx-auto h-8 w-8 text-gray-400" />
              <div className="space-y-1">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  {accept !== "*/*" && `Accepted formats: ${accept}`}
                  {maxSize && ` • Max size: ${formatFileSize(maxSize)}`}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {uploadStatus === "uploading" && uploadProgress !== null && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Uploading file...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {uploadStatus === "error" && errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
