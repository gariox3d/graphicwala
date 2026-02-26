import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Trash2, Image, RefreshCw, HardDrive } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface StorageFile {
  name: string;
  id: string;
  created_at: string;
  metadata: Record<string, any> | null;
  fullPath: string;
}

const BUCKETS = [
  { id: 'product-images', label: 'Product Images', icon: '📦' },
  { id: 'customer-designs', label: 'Customer Designs', icon: '🎨' },
  { id: 'customer-gallery', label: 'Customer Gallery', icon: '🖼️' },
  { id: 'review-images', label: 'Review Images', icon: '⭐' },
  { id: 'ad-images', label: 'Ad / Banner Images', icon: '📢' },
];

function formatSize(bytes: number) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function isImageFile(name: string, mimetype?: string | null) {
  return Boolean(mimetype?.startsWith('image/')) || /\.(jpg|jpeg|png|webp|gif|svg|bmp|avif)$/i.test(name);
}

const AdminStorage = () => {
  const [activeBucket, setActiveBucket] = useState(BUCKETS[0].id);
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [bucketCounts, setBucketCounts] = useState<Record<string, number>>({});
  const [bucketSizes, setBucketSizes] = useState<Record<string, number>>({});

  const listAllFiles = async (bucketId: string, folder: string = ''): Promise<StorageFile[]> => {
    const { data, error } = await supabase.storage.from(bucketId).list(folder, {
      limit: 500,
      sortBy: { column: 'created_at', order: 'desc' },
    });
    if (error || !data) return [];
    
    const results: StorageFile[] = [];
    
    for (const item of data) {
      if (item.name === '.emptyFolderPlaceholder') continue;
      const fullPath = folder ? `${folder}/${item.name}` : item.name;
      
      if (!item.id) {
        const subFiles = await listAllFiles(bucketId, fullPath);
        results.push(...subFiles);
      } else {
        results.push({ ...item, fullPath, metadata: item.metadata as Record<string, any> | null } as any);
      }
    }
    return results;
  };

  const fetchFiles = async (bucketId: string) => {
    setLoading(true);
    setSelectedFiles(new Set());

    try {
      const allFiles = await listAllFiles(bucketId);
      setFiles(allFiles);
    } catch (err: any) {
      toast.error('Files load nahi ho paye: ' + err.message);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllCounts = async () => {
    const counts: Record<string, number> = {};
    const sizes: Record<string, number> = {};
    await Promise.all(
      BUCKETS.map(async (b) => {
        const allFiles = await listAllFiles(b.id);
        counts[b.id] = allFiles.length;
        sizes[b.id] = allFiles.reduce((sum, f) => sum + ((f.metadata as any)?.size || 0), 0);
      })
    );
    setBucketCounts(counts);
    setBucketSizes(sizes);
  };

  useEffect(() => {
    fetchFiles(activeBucket);
    fetchAllCounts();
  }, [activeBucket]);

  const deleteFile = async (fileName: string) => {
    const { error } = await supabase.storage.from(activeBucket).remove([fileName]);
    if (error) {
      toast.error('Delete failed: ' + error.message);
    } else {
      toast.success('File deleted!');
      fetchFiles(activeBucket);
      fetchAllCounts();
    }
  };

  const deleteSelected = async () => {
    const filesToDelete = Array.from(selectedFiles);
    if (filesToDelete.length === 0) return;

    const { error } = await supabase.storage.from(activeBucket).remove(filesToDelete);
    if (error) {
      toast.error('Delete failed: ' + error.message);
    } else {
      toast.success(`${filesToDelete.length} files deleted!`);
      setSelectedFiles(new Set());
      fetchFiles(activeBucket);
      fetchAllCounts();
    }
  };

  const toggleFile = (path: string) => {
    setSelectedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedFiles.size === files.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(files.map((f) => f.fullPath)));
    }
  };

  const getPublicUrl = (filePath: string, bucket?: string) => {
    const { data } = supabase.storage.from(bucket || activeBucket).getPublicUrl(filePath);
    return data.publicUrl;
  };

  const totalSize = files.reduce((sum, f) => sum + (f.metadata?.size || 0), 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <HardDrive className="h-6 w-6" /> Storage Manager
            </h1>
            <p className="text-muted-foreground text-sm">
              Apne store ki saari images yahan se manage karein — jo zarurat nahi, delete karein.
            </p>
          </div>
        </div>

        {/* Storage Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {BUCKETS.map((b) => (
            <Card key={b.id} className={`cursor-pointer transition-all ${activeBucket === b.id ? 'ring-2 ring-primary' : 'hover:border-primary/50'}`} onClick={() => setActiveBucket(b.id)}>
              <CardContent className="p-3 text-center">
                <p className="text-lg">{b.icon}</p>
                <p className="text-xs font-medium truncate">{b.label}</p>
                <p className="text-sm font-bold text-primary">{formatSize(bucketSizes[b.id] || 0)}</p>
                <p className="text-[10px] text-muted-foreground">{bucketCounts[b.id] || 0} files</p>
              </CardContent>
            </Card>
          ))}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-3 text-center">
              <p className="text-lg">💾</p>
              <p className="text-xs font-medium">Total</p>
              <p className="text-sm font-bold text-primary">{formatSize(Object.values(bucketSizes).reduce((a, b) => a + b, 0))}</p>
              <p className="text-[10px] text-muted-foreground">{Object.values(bucketCounts).reduce((a, b) => a + b, 0)} files</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeBucket} onValueChange={setActiveBucket}>
          <TabsList className="flex flex-wrap h-auto gap-1">
            {BUCKETS.map((b) => (
              <TabsTrigger key={b.id} value={b.id} className="text-xs sm:text-sm">
                {b.icon} {b.label}
                {bucketCounts[b.id] !== undefined && (
                  <Badge variant="secondary" className="ml-1 text-[10px]">
                    {bucketCounts[b.id]}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {BUCKETS.map((b) => (
            <TabsContent key={b.id} value={b.id}>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <CardTitle className="text-lg">
                      {b.icon} {b.label} — {files.length} files ({formatSize(totalSize)})
                    </CardTitle>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button size="sm" variant="outline" onClick={() => fetchFiles(activeBucket)}>
                        <RefreshCw className="h-4 w-4 mr-1" /> Refresh
                      </Button>
                      {files.length > 0 && (
                        <Button size="sm" variant="outline" onClick={selectAll}>
                          {selectedFiles.size === files.length ? 'Deselect All' : 'Select All'}
                        </Button>
                      )}
                      {selectedFiles.size > 0 && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              <Trash2 className="h-4 w-4 mr-1" /> Delete {selectedFiles.size} files
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
                              <AlertDialogDescription>
                                {selectedFiles.size} files permanently delete ho jayengi. Yeh action undo nahi hoga.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={deleteSelected}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-12 text-muted-foreground">
                      Loading...
                    </div>
                  ) : files.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <Image className="h-12 w-12 mb-2 opacity-30" />
                      <p>No files in this bucket</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {files.map((file) => {
                        const isImage = isImageFile(file.name, file.metadata?.mimetype);
                        const isSelected = selectedFiles.has(file.fullPath);
                        const previewUrl = getPublicUrl(file.fullPath);

                        return (
                          <div
                            key={file.fullPath}
                            className={`relative group border rounded-lg overflow-hidden cursor-pointer transition-all ${
                              isSelected ? 'ring-2 ring-primary border-primary' : 'hover:border-primary/50'
                            }`}
                            onClick={() => toggleFile(file.fullPath)}
                          >
                            {/* Checkbox */}
                            <div className={`absolute top-2 left-2 z-10 w-5 h-5 rounded border-2 flex items-center justify-center text-xs font-bold transition-all ${
                              isSelected ? 'bg-primary border-primary text-primary-foreground' : 'bg-background/80 border-muted-foreground/40'
                            }`}>
                              {isSelected && '✓'}
                            </div>

                            {/* Image preview */}
                            <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                              {isImage ? (
                                <img
                                  src={previewUrl}
                                  alt={file.name}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="text-center p-2">
                                  <Image className="h-8 w-8 mx-auto opacity-40" />
                                  <p className="text-[10px] text-muted-foreground mt-1 truncate">
                                    {file.metadata?.mimetype || 'file'}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Info */}
                            <div className="p-2">
                              <p className="text-[11px] truncate font-medium" title={file.fullPath}>
                                {file.name}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {formatSize(file.metadata?.size || 0)}
                              </p>
                            </div>

                            {/* Quick delete */}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="destructive"
                                  className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete file?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    "{file.name}" permanently delete hogi.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteFile(file.fullPath)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminStorage;
