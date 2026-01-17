import type { MediaAsset } from "@/types/data";

const media_assets: MediaAsset[] = [
   {
      id: 1,
      url: "https://res.cloudinary.com/demo/image/upload/v1234567890/hero-banner.jpg",
      type: "image",
      alt: "Hero banner featuring network infrastructure",
      tags: ["hero", "banner", "network"],
      createdAt: "2026-01-01T00:00:00Z",
      usageCount: 15
   },
   {
      id: 2,
      url: "https://res.cloudinary.com/demo/image/upload/v1234567890/team-photo.jpg",
      type: "image",
      alt: "Team photo of network engineers",
      tags: ["team", "people", "engineering"],
      createdAt: "2026-01-02T00:00:00Z",
      usageCount: 8
   },
   {
      id: 3,
      url: "https://res.cloudinary.com/demo/video/upload/v1234567890/product-demo.mp4",
      type: "video",
      alt: "Product demonstration video",
      tags: ["demo", "product", "video"],
      createdAt: "2026-01-03T00:00:00Z",
      usageCount: 3
   },
   {
      id: 4,
      url: "https://res.cloudinary.com/demo/image/upload/v1234567890/feature-icon-1.png",
      type: "image",
      alt: "Network monitoring feature icon",
      tags: ["icon", "feature", "monitoring"],
      createdAt: "2026-01-04T00:00:00Z",
      usageCount: 12
   },
   {
      id: 5,
      url: "https://res.cloudinary.com/demo/image/upload/v1234567890/blog-thumbnail-1.jpg",
      type: "image",
      alt: "Blog post thumbnail about SD-WAN",
      tags: ["blog", "thumbnail", "sd-wan"],
      createdAt: "2026-01-05T00:00:00Z",
      usageCount: 6
   },
   {
      id: 6,
      url: "https://res.cloudinary.com/demo/video/upload/v1234567890/tutorial-video.mp4",
      type: "video",
      alt: "Wi-Fi setup tutorial video",
      tags: ["tutorial", "video", "wi-fi"],
      createdAt: "2026-01-06T00:00:00Z",
      usageCount: 4
   },
];

export default media_assets;
export const mediaAssetsById = new Map(media_assets.map(asset => [asset.id, asset]));
export const mediaAssetsByType = new Map(
   Object.entries(media_assets.reduce((acc, asset) => {
      if (!acc[asset.type]) {
         acc[asset.type] = [];
      }
      acc[asset.type].push(asset);
      return acc;
   }, {} as Record<string, MediaAsset[]>))
);
