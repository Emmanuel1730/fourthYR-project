from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
FILES = [
    BASE / 'src' / 'components' / 'teacher-dashboard' / fn
    for fn in ['MyClasses.jsx', 'StudentProgress.jsx', 'CreateQuiz.jsx', 'structuredTest.jsx']
]

REPLACEMENTS = [
    ('min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-gray-200 p-6',
     'min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-white text-gray-900 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 dark:text-gray-200 p-6'),
    ('bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-gray-200',
     'bg-gradient-to-br from-gray-100 via-gray-50 to-white text-gray-900 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 dark:text-gray-200'),
    ('min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800',
     'min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-800'),
    ('bg-gray-900/50', 'bg-white/50 dark:bg-gray-900/50'),
    ('bg-gray-900/30', 'bg-white/30 dark:bg-gray-900/30'),
    ('bg-gray-900/95', 'bg-white/95 dark:bg-gray-900/95'),
    ('bg-gray-900', 'bg-white dark:bg-gray-900'),
    ('bg-gray-800/50', 'bg-white/50 dark:bg-gray-800/50'),
    ('bg-gray-800/30', 'bg-white/30 dark:bg-gray-800/30'),
    ('bg-gray-800', 'bg-white dark:bg-gray-800'),
    ('bg-gray-700/30', 'bg-white/30 dark:bg-gray-700/30'),
    ('bg-gray-700', 'bg-white dark:bg-gray-700'),
    ('text-gray-200', 'text-gray-900 dark:text-gray-200'),
    ('text-gray-300', 'text-gray-700 dark:text-gray-300'),
    ('text-gray-400', 'text-gray-500 dark:text-gray-400'),
    ('text-gray-100', 'text-gray-900 dark:text-gray-100'),
    ('border-gray-700', 'border-gray-200 dark:border-gray-700'),
    ('border-gray-600', 'border-gray-300 dark:border-gray-600'),
    ('placeholder-gray-500', 'placeholder-gray-400 dark:placeholder-gray-500'),
    ('hover:border-gray-600', 'hover:border-gray-300 dark:hover:border-gray-600'),
    ('hover:bg-gray-700/30', 'hover:bg-gray-100 dark:hover:bg-gray-700/30'),
    ('bg-gray-50/30', 'bg-white/30 dark:bg-gray-800/30'),
    ('bg-gray-50/50', 'bg-white/50 dark:bg-gray-900/50'),
]

for file in FILES:
    if not file.exists():
        print(f'MISSING: {file}')
        continue
    text = file.read_text(encoding='utf-8')
    original = text
    for old, new in REPLACEMENTS:
        text = text.replace(old, new)
    if text != original:
        file.write_text(text, encoding='utf-8')
        print(f'Updated {file.name}')
    else:
        print(f'No changes for {file.name}')
