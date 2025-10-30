---
name: Maskom Image Regeneration Agent
type: knowledge
version: 1.0.0
agent: CodeActAgent
triggers:
  - gambar
---

# Maskom Image Regeneration Microagent

This microagent helps regenerate images for the Maskom website using the prompts defined in the `gambar.md` file.

## Purpose

The Maskom website requires various images including logos, hero images, client logos, work images, feature images, video thumbnails, testimonial headshots, and contact icons. This microagent provides guidance and automation for regenerating these images using AI image generation tools.

## Available Images to Regenerate

Based on the `gambar.md` file, the following images can be regenerated:

1. **Main Logo** - Modern professional logo with blue (#004BFF) and white (#ffffff) colors
2. **Hero Image (Dashboard)** - Futuristic network representation with glowing connections
3. **Client Logos (Set of 8)** - Fictional company logos in light gray (#A9ADB9)
4. **Work Images (3 types)**:
   - Discovery & Assessment - Team analyzing network data
   - Solution Design & Pilot - Network architect presenting solutions
   - Operate & Optimize - Network Operations Center (NOC)
5. **Features Image** - Abstract representation of scalable network, security, and operations
6. **Video Image Thumbnail** - Corporate video thumbnail with play button
7. **Testimonial Author Headshots (Set of 6)** - Professional diverse headshots
8. **Contact Icons (Set of 4)** - Address, Email, Phone, Working Hours icons

## Color Palette

- Primary Blue: #004BFF
- Green Accent: #65FF4B
- White: #ffffff
- Dark Background: #1D1D1D
- Light Gray: #A9ADB9

## Usage Instructions

When triggered by "gambar", this microagent will:

1. **Reference the gambar.md file** - Always check the current prompts in `gambar.md`
2. **Provide specific prompts** - Extract and format the appropriate image generation prompts
3. **Suggest tools** - Recommend AI image generation tools (Google AI Studio, DALL-E, Midjourney, etc.)
4. **Guide file naming** - Suggest appropriate file names and formats
5. **Specify dimensions** - Provide correct aspect ratios and resolutions
6. **Maintain consistency** - Ensure all images follow the brand color palette

## Workflow

1. Identify which image(s) need to be regenerated
2. Extract the relevant prompt(s) from `gambar.md`
3. Provide the formatted prompt for the image generation tool
4. Suggest appropriate file naming conventions
5. Recommend where to save the generated images in the project structure

## File Organization

Generated images should typically be saved in:
- `/public/images/` - For web-accessible images
- `/src/assets/images/` - For bundled images
- Follow existing project structure and naming conventions

## Limitations

- This microagent provides prompts and guidance but cannot directly generate images
- Actual image generation requires external AI tools
- Generated images may need manual review and optimization
- Brand consistency should be manually verified

## Example Usage

When a user mentions "gambar" or asks about regenerating images, provide:
1. The specific prompt from `gambar.md`
2. Recommended tools and settings
3. File naming suggestions
4. Integration guidance for the Maskom website