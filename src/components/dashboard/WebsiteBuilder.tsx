import React from "react";
import Image from "next/image";
import { WebsiteTemplate } from "@/types/data";

interface WebsiteBuilderProps {
  templates: WebsiteTemplate[];
  editorPlaceholder?: string;
}

const WebsiteBuilder = ({ templates, editorPlaceholder = "Edit your website content here..." }: WebsiteBuilderProps) => {
  return (
    <div className="website-builder">
      <h2>Website Builder</h2>
      <div className="template-selection mb-4">
        <h4>Select Template</h4>
        <div className="row">
          {templates.map(template => (
            <div key={template.id} className="col-md-4">
              <div className="card">
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
                  <button className="btn btn-primary">Use Template</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="editor">
        <h4>Editor</h4>
        <textarea className="form-control" rows={10} placeholder={editorPlaceholder}></textarea>
      </div>
      <div className="mt-3">
        <button className="btn btn-success">Preview</button>
        <button className="btn btn-secondary ms-2">Publish</button>
      </div>
    </div>
   );
};

export default React.memo(WebsiteBuilder);