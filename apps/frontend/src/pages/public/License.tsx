import React from 'react';
import { motion } from 'motion/react';

export const License: React.FC = () => {
  return (
    <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight text-theme-text-primary">
              License Agreement
            </h1>
            <p className="text-lg text-theme-text-secondary">
              SailorLabs Source Available License (SSAL) v1.0
            </p>
          </div>

          <div className="bg-theme-bg-secondary rounded-2xl shadow-xl shadow-theme-border/20 border border-theme-border p-8 md:p-12 text-theme-text-secondary space-y-6">
            <p className="font-semibold text-theme-text-primary mb-8">
              Copyright (c) 2026 SailorLabs.in
            </p>

            <p>
              This license applies to the software project &quot;Vibe-message&quot;, including its
              client package, server components, and related source code (collectively referred to
              as the &ldquo;Software&rdquo;).
            </p>

            <h3 className="text-xl font-bold text-theme-text-primary mt-8 mb-4">
              1. Source Code Availability
            </h3>
            <p>
              The source code of the Software is publicly available. You are permitted to view,
              clone, copy, and modify the Software for personal, educational, research, or
              commercial use, subject to the terms of this license.
            </p>

            <h3 className="text-xl font-bold text-theme-text-primary mt-8 mb-4">
              2. Permitted Use
            </h3>
            <p>You may:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Use the Software in personal or educational projects</li>
              <li>Use the Software in commercial applications</li>
              <li>Modify the Software</li>
              <li>Deploy the Software on infrastructure you control</li>
              <li>Integrate the Software into your own applications or services</li>
              <li>
                Operate private instances of the server for internal or application-specific use
              </li>
            </ul>

            <h3 className="text-xl font-bold text-theme-text-primary mt-8 mb-4">3. Self-Hosting</h3>
            <p>
              You are permitted to deploy and operate your own instance of the Software on
              infrastructure you control. This includes use within private systems, internal company
              tools, or applications built using the Software.
            </p>

            <h3 className="text-xl font-bold text-theme-text-primary mt-8 mb-4">
              4. Public Service Restriction
            </h3>
            <p>
              You may not use the Software to operate or offer a public hosted service that competes
              with the official Vibe-message service operated by SailorLabs.in.
            </p>
            <p className="mt-4">Prohibited activities include:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Providing the Software as a hosted notification platform</li>
              <li>Selling or distributing access to a public Vibe-message server</li>
              <li>Offering the Software as a standalone SaaS platform</li>
              <li>Running a public instance intended for third-party usage</li>
            </ul>

            <h3 className="text-xl font-bold text-theme-text-primary mt-8 mb-4">
              5. Redistribution Restrictions
            </h3>
            <p>
              You may not sell or distribute the Software itself as a standalone product.
              Redistribution of the Software outside your organization is not permitted except
              through contributions to the official repository.
            </p>
            <p className="mt-4">
              Forks created solely for contributing improvements back to the official repository are
              allowed.
            </p>

            <h3 className="text-xl font-bold text-theme-text-primary mt-8 mb-4">6. Attribution</h3>
            <p>Applications using the Software should include reasonable attribution to:</p>
            <p className="mt-2 font-medium italic">Vibe-message by SailorLabs.in</p>

            <h3 className="text-xl font-bold text-theme-text-primary mt-8 mb-4">7. No Warranty</h3>
            <p className="uppercase text-sm tracking-wide bg-theme-bg-muted p-4 rounded-lg border border-theme-border">
              THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
              IMPLIED, INCLUDING BUT NOT LIMITED TO MERCHANTABILITY, FITNESS FOR A PARTICULAR
              PURPOSE, AND NONINFRINGEMENT.
            </p>

            <h3 className="text-xl font-bold text-theme-text-primary mt-8 mb-4">
              8. Limitation of Liability
            </h3>
            <p className="uppercase text-sm tracking-wide bg-theme-bg-muted p-4 rounded-lg border border-theme-border mt-2">
              IN NO EVENT SHALL SAILORLABS.IN OR THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES, OR
              OTHER LIABILITY ARISING FROM THE USE OF THE SOFTWARE.
            </p>

            <h3 className="text-xl font-bold text-theme-text-primary mt-8 mb-4">
              9. License Updates
            </h3>
            <p>
              SailorLabs.in reserves the right to update or modify this license in future versions
              of the Software.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
