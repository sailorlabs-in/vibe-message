import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { useSystem } from '../../context/SystemContext';

export const License: React.FC = () => {
  const { isSelfHosted } = useSystem();

  useEffect(() => {
    if (isSelfHosted) {
      window.location.replace('https://vibemessage.sailorlabs.in/license');
    }
  }, [isSelfHosted]);

  return (
    <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-theme-bg-secondary border border-theme-border text-xs font-mono font-semibold text-theme-text-muted mb-4 shadow-2xs">
              <span>LEGAL SPECIFICATION</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold mb-3 tracking-tight text-theme-text-primary">
              License Agreement
            </h1>
            <p className="text-base sm:text-lg text-theme-text-secondary">
              SailorLabs Source Available License (SSAL) v1.0
            </p>
          </div>

          <div className="bg-theme-bg-secondary rounded-2xl sm:rounded-3xl shadow-xs border border-theme-border p-8 md:p-12 text-theme-text-secondary space-y-6 leading-relaxed">
            <p className="font-bold text-theme-text-primary text-base">
              Copyright (c) 2026 SailorLabs.in
            </p>

            <p>
              This license applies to the software project &quot;Vibe-message&quot;, including its
              client package, server components, and related source code (collectively referred to
              as the &ldquo;Software&rdquo;).
            </p>

            <h3 className="text-xl font-display font-bold text-theme-text-primary pt-4">
              1. Source Code Availability
            </h3>
            <p>
              The source code of the Software is publicly available. You are permitted to view,
              clone, copy, and modify the Software for personal, educational, research, or
              commercial use, subject to the terms of this license.
            </p>

            <h3 className="text-xl font-display font-bold text-theme-text-primary pt-4">
              2. Permitted Use
            </h3>
            <p>You may:</p>
            <ul className="space-y-2.5 pl-1">
              {[
                'Use the Software in personal or educational projects',
                'Use the Software in commercial applications',
                'Modify the Software',
                'Deploy the Software on infrastructure you control',
                'Integrate the Software into your own applications or services',
                'Operate private instances of the server for internal or application-specific use',
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm sm:text-base text-theme-text-secondary">
                  <span className="w-1.5 h-1.5 rounded-full bg-theme-primary-500 mt-2 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <h3 className="text-xl font-display font-bold text-theme-text-primary pt-4">
              3. Self-Hosting
            </h3>
            <p>
              You are permitted to deploy and operate your own instance of the Software on
              infrastructure you control. This includes use within private systems, internal company
              tools, or applications built using the Software.
            </p>

            <h3 className="text-xl font-display font-bold text-theme-text-primary pt-4">
              4. Public Service Restriction
            </h3>
            <p>
              You may not use the Software to operate or offer a public hosted service that competes
              with the official Vibe-message service operated by SailorLabs.in.
            </p>
            <p className="font-semibold text-theme-text-primary">Prohibited activities include:</p>
            <ul className="space-y-2.5 pl-1">
              {[
                'Providing the Software as a hosted notification platform',
                'Selling or distributing access to a public Vibe-message server',
                'Offering the Software as a standalone SaaS platform',
                'Running a public instance intended for third-party usage',
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm sm:text-base text-theme-text-secondary">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <h3 className="text-xl font-display font-bold text-theme-text-primary pt-4">
              5. Redistribution Restrictions
            </h3>
            <p>
              You may not sell or distribute the Software itself as a standalone product.
              Redistribution of the Software outside your organization is not permitted except
              through contributions to the official repository.
            </p>
            <p>
              Forks created solely for contributing improvements back to the official repository are
              allowed.
            </p>

            <h3 className="text-xl font-display font-bold text-theme-text-primary pt-4">
              6. Attribution
            </h3>
            <p>Applications using the Software should include reasonable attribution to:</p>
            <p className="font-semibold text-theme-text-primary italic">
              Vibe-message by SailorLabs.in
            </p>

            <h3 className="text-xl font-display font-bold text-theme-text-primary pt-4">
              7. Disclaimer of Warranty
            </h3>
            <p className="uppercase text-xs font-semibold tracking-wider text-theme-text-muted leading-relaxed">
              THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
              IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
              PARTICULAR PURPOSE, AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
              HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER LIABILITY, WHETHER IN AN ACTION OF
              CONTRACT, TORT, OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
              OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
