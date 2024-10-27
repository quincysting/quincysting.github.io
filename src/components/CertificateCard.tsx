import React from 'react';

interface CertificateCardProps {
  title: string;
  issuer: string;
  date: string;
  credlyLink: string;
}

const CertificateCard = ({ title, issuer, date, credlyLink }: CertificateCardProps) => {
  return (
    <div className="aws-card rounded-lg p-6 hover:border-[var(--aws-orange)] transition-colors">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <div className="text-gray-300">
          <p>{issuer}</p>
          <p className="text-sm">Issued {date}</p>
        </div>
        <a
          href={credlyLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 text-[var(--aws-orange)] hover:text-[#ffb84d]"
        >
          View Certificate
        </a>
      </div>
    </div>
  );
};

export default CertificateCard;