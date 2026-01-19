"use client";

import React, { memo, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import type { EmailCampaign } from '@/types/campaign';
import type { EmailTemplate } from '@/types/data';
import email_template_data from '@/data/EmailTemplateData';
import { substituteTemplateVariables, type VariableSubstitution } from '@/utils/templateUtils';

const CampaignPreview = memo(({ campaign }: { campaign: EmailCampaign }) => {
    const { theme } = useTheme();
    const [previewSubject, setPreviewSubject] = useState<string>('');
    const [previewBody, setPreviewBody] = useState<string>('');

    const template: EmailTemplate | undefined = email_template_data.find(
        (t) => t.id === campaign.templateId
    );

    React.useEffect(() => {
        if (template && campaign.variableValues) {
            const substitutions: VariableSubstitution[] = Object.entries(campaign.variableValues || {}).map(
                ([key, value]) => ({
                    key,
                    value,
                    required: false,
                })
            );

            const result = substituteTemplateVariables(template, substitutions);

            setPreviewSubject(campaign.subject || result.subject);
            setPreviewBody(result.body);
        }
    }, [template, campaign.variableValues, campaign.subject]);

    if (!template) {
        return (
            <div className="alert alert-warning">
                <i className="bi bi-exclamation-triangle me-2"></i>
                Email template not found (ID: {campaign.templateId})
            </div>
        );
    }

    return (
        <div className={`campaign-preview ${theme === 'dark' ? 'dark-mode' : ''}`}>
            <div className="card shadow-sm">
                <div className="card-header bg-white">
                    <h6 className="mb-0">
                        <i className="bi bi-eye me-2"></i>
                        Preview: {campaign.name}
                    </h6>
                </div>
                <div className="card-body">
                    <div className="mb-3">
                        <strong>Subject:</strong>
                        <div className="border p-2 rounded bg-light">
                            {previewSubject}
                        </div>
                    </div>
                    <div>
                        <strong>Body:</strong>
                        <div
                            className="border p-3 rounded bg-light"
                            style={{
                                minHeight: '300px',
                                whiteSpace: 'pre-wrap',
                                fontFamily: 'monospace',
                            }}
                        >
                            {previewBody}
                        </div>
                    </div>
                    {campaign.variableValues && Object.keys(campaign.variableValues).length > 0 && (
                        <div className="mt-3">
                            <strong>Variables:</strong>
                            <div className="table-responsive">
                                <table className="table table-sm">
                                    <tbody>
                                        {Object.entries(campaign.variableValues).map(([key, value]) => (
                                            <tr key={key}>
                                                <td><code>{key}</code></td>
                                                <td>{value}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

CampaignPreview.displayName = 'CampaignPreview';

export default CampaignPreview;
