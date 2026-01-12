import React from "react";
import Image from "next/image";
import { WebsiteTemplate } from "@/types/data";

interface WebsiteBuilderProps {
  templates: WebsiteTemplate[];
  editorPlaceholder?: string;
}

const WebsiteBuilder = ({ templates, editorPlaceholder = "Edit your website content here..." }: WebsiteBuilderProps) => {
  return (
    <div className="website-builder" role="main">
      <h2>Website Builder</h2>
      <div className="template-selection mb-4" role="region" aria-label="Template selection">
        <h4 id="template-selection-title">Select Template</h4>
        <div className="row" role="list" aria-labelledby="template-selection-title">
          {templates.map(template => (
            <div key={template.id} className="col-md-4" role="listitem">
              <article className="card">
                <Image
                  src={template.preview}
                  className="card-img-top"
                  alt={template.name}
                  width={300}
                  height={200}
                  loading="lazy"
                />
                <div className="card-body">
                  <h5 className="card-title">{template.name}</h5>
                  <button 
                    className="btn btn-primary" 
                    aria-label={`Gunakan template ${template.name}`}
                  >
                    Use Template
                  </button>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
      <div className="editor" role="region" aria-label="Website editor">
        <h4 id="editor-title">Editor</h4>
        <label htmlFor="website-editor" className="visually-hidden">Editor konten website</label>
        <textarea 
          id="website-editor"
          className="form-control" 
          rows={10} 
          placeholder={editorPlaceholder}
          aria-labelledby="editor-title"
        ></textarea>
      </div>
      <div className="mt-3" role="toolbar" aria-label="Website builder actions">
        <button className="btn btn-success" aria-label="Pratinjau website">Preview</button>
        <button className="btn btn-secondary ms-2" aria-label="Terbitkan website">Publish</button>
      </div>
    </div>
   );
};

export default React.memo(WebsiteBuilder);