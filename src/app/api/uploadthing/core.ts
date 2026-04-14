import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { auth } from '@/lib/auth';

const f = createUploadthing();

export const ourFileRouter = {
  // Provider logo upload (1 image or PDF, max 4MB)
  providerLogo: f({
    image: { maxFileSize: '4MB', maxFileCount: 1 },
    pdf: { maxFileSize: '4MB', maxFileCount: 1 },
  })
    .middleware(async () => {
      const session = await auth();
      if (!session?.user) throw new Error('Unauthorized');
      return { companyId: session.user.companyId };
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl };
    }),

  // Lead photos/documents upload (up to 5 files, max 8MB each)
  leadPhotos: f({
    image: { maxFileSize: '8MB', maxFileCount: 5 },
    pdf: { maxFileSize: '8MB', maxFileCount: 5 },
  })
    .middleware(async () => {
      const session = await auth();
      if (!session?.user) throw new Error('Unauthorized');
      if (!session.user.company.canUseReferrerPortal) throw new Error('Referrer access required');
      return { companyId: session.user.companyId };
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl };
    }),

  // A-Team pitch photos (1-4 images, max 8MB each)
  pitchPhotos: f({
    image: { maxFileSize: '8MB', maxFileCount: 4 },
  })
    .middleware(async () => {
      const session = await auth();
      if (!session?.user) throw new Error('Unauthorized');
      if (!session.user.company.canUseProviderPortal) {
        throw new Error('Provider access required');
      }
      return { companyId: session.user.companyId };
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
