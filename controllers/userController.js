exports.getIndex = (req, res, next) => {
    res.render("user/index.ejs", {
        pageTitle: "Home page",
        currentPage: "home",
    });
};

exports.getMaterial = (req, res, next) => {
    const fs = require('fs');
    const path = require('path');

    const publicDir = path.join(__dirname, '..', 'public');

    const isPdf = (name) => /\.pdf$/i.test(name);
    const toTitle = (filename) => filename
        .replace(/\.pdf$/i, '')
        .replace(/[\-_]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    const detectExam = (relativePath) => {
        const normalized = relativePath.replace(/\\/g, '/').toLowerCase();
        const base = path.basename(relativePath).toLowerCase();
        if (/(^|\/)jee(\/.|$)/.test(normalized) || base.startsWith('jee')) return 'JEE';
        if (/(^|\/)neet(\/.|$)/.test(normalized) || base.startsWith('neet')) return 'NEET';
        if (/(^|\/)upsc(\/.|$)/.test(normalized) || base.startsWith('upsc')) return 'UPSC';
        return null;
    };

    const walk = (dirRel) => {
        const abs = path.join(publicDir, dirRel);
        if (!fs.existsSync(abs)) return [];
        const entries = fs.readdirSync(abs, { withFileTypes: true });
        let files = [];
        for (const ent of entries) {
            const childRel = path.join(dirRel, ent.name);
            if (ent.isDirectory()) {
                files = files.concat(walk(childRel));
            } else if (ent.isFile() && isPdf(ent.name)) {
                files.push(childRel);
            }
        }
        return files;
    };

    const relativePdfPaths = walk('');
    const materials = relativePdfPaths
        .map((rel, idx) => {
            const exam = detectExam(rel);
            if (!exam) return null; // only include recognized exams
            const title = toTitle(path.basename(rel));
            return {
                _id: `pdf-${idx}`,
                title,
                description: '',
                type: 'notes',
                exam,
                subject: '',
                author: 'Public',
                tags: [],
                downloads: 0,
                views: 0,
                averageRating: 0,
                pdfUrl: `/${rel.replace(/\\/g, '/')}`
            };
        })
        .filter(Boolean)
        .sort((a, b) => a.exam.localeCompare(b.exam) || a.title.localeCompare(b.title));

    res.render("user/materials.ejs", {
        pageTitle: "Materials",
        currentPage: "materials",
        materials
    });
};

exports.getAbout = (req, res, next) => {
    res.render("user/about.ejs", {
        pageTitle: "About",
        currentPage: "about",
    });
};

exports.getContactus = (req, res, next) => {
    res.render("user/contactus.ejs", {
        pageTitle: "Contact Us",
        currentPage: "contactus",
    });
};