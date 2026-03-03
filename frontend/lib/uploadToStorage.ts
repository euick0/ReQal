import { createClient } from "@/lib/supabase/client";

type StorageBucket = "flashcard-images" | "flashcard-audio";

export async function uploadFile(file: File, bucket: StorageBucket) {
       try {
           const supabase = createClient();
           const { data: { user } } = await supabase.auth.getUser();
           if (!user) return { data: null, error: new Error("User not authenticated") };

           const ext = file.name.split(".").pop();
           const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
           const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });

           if (error) return { data: null, error: new Error(`Upload failed: ${error.message}`) };
           const { data } = supabase.storage.from(bucket).getPublicUrl(path);
           return { data: data.publicUrl, error: null };
       } catch (err) {
           return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
       }
   }
