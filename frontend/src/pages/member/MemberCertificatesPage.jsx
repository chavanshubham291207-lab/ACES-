import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Award, Download } from 'lucide-react';
import EmptyState from '../../components/common/EmptyState';

const MemberCertificatesPage = () => {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/certificates/my-certificates')
      .then(res => setCerts(res.data.certificates || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">My Certificates</h1>
        <p className="text-xs text-slate-500">Download your verified ACES event and workshop credentials.</p>
      </div>

      {certs.length === 0 ? (
        <EmptyState title="No certificates issued yet" message="Certificates will appear here once issued by executive committee members." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {certs.map((c) => (
            <div key={c._id} className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="p-3 bg-amber-500/10 text-amber-500 w-fit rounded-2xl">
                  <Award className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{c.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{c.description}</p>
                <p className="text-[11px] text-slate-500">Issued on: {new Date(c.issueDate).toLocaleDateString()}</p>
              </div>

              <a
                href={c.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors"
              >
                <Download className="w-4 h-4" /> Download Certificate
              </a>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default MemberCertificatesPage;
