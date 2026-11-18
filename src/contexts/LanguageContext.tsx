import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'vi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

// Detect user's location-based language
function detectUserLanguage(): Language {
  const queryLanguage = new URLSearchParams(window.location.search).get('lang');
  if (queryLanguage === 'en' || queryLanguage === 'vi') return queryLanguage;

  // Check localStorage first
  const saved = localStorage.getItem('language');
  if (saved === 'en' || saved === 'vi') {
    return saved;
  }

  // Check browser language
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('vi')) {
    return 'vi';
  }

  // Default to English
  return 'en';
}

const translations = {
  en: {
    // Header
    'header.title': 'CutPrompts',
    'header.subtitle': 'Free & unlimited prompt splitter for all AI models',
    'header.howToUse': 'How to Use',
    
    // Privacy Policy
    'privacy.title': 'Privacy Policy',
    'privacy.introduction': 'Introduction',
    'privacy.introText': 'CutPrompts respects your privacy. This Privacy Policy explains how we handle your information when you use our website and services.',
    'privacy.dataCollection': 'Information We Collect',
    'privacy.noDataCollected': 'Prompt text and split results stay in your browser. Our site also uses analytics and a visit counter as described below. CutPrompts does not display ads.',
    'privacy.noAccountRequired': 'You can split prompts without creating an account.',
    'privacy.noPersonalInfo': 'We do not ask you to submit personal information or prompt contents to use the splitter.',
    'privacy.noTracking': 'Google Analytics may process device and usage data under its own privacy policy.',
    'privacy.clientSideOnly': 'Prompt splitting, previews, and locally saved prompt history are processed on your device. The visit counter sends a random session ID to our server.',
    'privacy.cookies': 'Cookies and Tracking',
    'privacy.cookieUsage': 'We store your language, theme, and prompt settings in browser storage. Google Analytics may set cookies or use similar technologies, subject to its policy and applicable consent requirements.',
    'privacy.thirdParty': 'Third-Party Services',
    'privacy.thirdPartyServices': 'We use Google Analytics for site statistics, Vercel for hosting, and an Upstash-backed visit counter. Visiting Ko-fi opens a separate third-party site. Please review each provider’s privacy policy.',
    'privacy.analytics': 'Analytics',
    'privacy.analyticsInfo': 'CutPrompts does not serve advertisements. Google Analytics measures site usage and may process data under Google’s privacy practices and applicable consent requirements.',
    'privacy.security': 'Security',
    'privacy.securityMeasures': 'We do not send prompt contents to our visitor-count API. The API stores a random session identifier temporarily to prevent repeat counts, and an aggregate visit total. Infrastructure providers may process request logs.',
    'privacy.changes': 'Changes to This Policy',
    'privacy.policyChanges': 'We may update this Privacy Policy occasionally. Updates will be posted on this page.',
    
    // Terms of Service
    'terms.title': 'Terms of Service',
    'terms.acceptance': 'Acceptance of Terms',
    'terms.acceptanceText': 'By accessing or using CutPrompts, you agree to these Terms of Service and all applicable laws and regulations.',
    'terms.useOfService': 'Use of Service',
    'terms.useOfServiceText': 'You agree to use CutPrompts responsibly and only for lawful purposes. You must not:',
    'terms.use1': 'Use the service for illegal activities',
    'terms.use2': 'Attempt to reverse-engineer, hack, or disrupt the service',
    'terms.use3': 'Use automated tools or bots to access the service',
    'terms.use4': 'Abuse, overload, or interfere with our systems',
    'terms.intellectualProperty': 'Intellectual Property',
    'terms.intellectualPropertyText': 'The CutPrompts name and original project assets are associated with LOHUX. Third-party brands, libraries, and contributed content remain the property of their respective owners and licensors.',
    'terms.thirdPartyServices': 'Third-Party Services',
    'terms.thirdPartyServicesText': 'CutPrompts is free to use without advertising. We use Vercel for hosting, Google Analytics for usage statistics, and Upstash for the visit counter when configured. Ko-fi is an optional external donation link. Third-party services follow their own policies.',
    'terms.limitation': 'Limitation of Liability',
    'terms.limitationText': 'CutPrompts is provided "as is" without any warranties. We are not liable for any damages or losses resulting from your use of the service.',
    'terms.changes': 'Changes to Terms',
    'terms.changesText': 'We may update these Terms from time to time. Continued use of the service after changes means you accept the updated terms.',
    
    // Main
    'main.title': 'Split Your Long Prompts',
    'notice.delimiterMissing': 'Delimiter not found. Used the selected split method and budget.',
    'notice.saved': 'Saved to local history on this device.',
    'notice.saveFailed': 'Unable to save: storage full or prompt longer than 500,000 characters.',
    'notice.historyTooltip': 'Save this prompt in browser history on this device',
    'notice.clipboardDenied': 'Clipboard access was denied. Select and copy the text manually, or download it.',
    'notice.invalidFormat': 'Choose a TXT or Markdown file.',
    'notice.fileTooLarge': 'Maximum upload size is 5 MB.',
    'notice.invalidUtf8': 'Cannot read this file as UTF-8 text.',
    'notice.estimated': 'estimate',
    'button.saveHistory': 'Save to History',
    'batch.filesLimit': 'Up to 10 files per batch, each up to 1 MB (UTF-8).',
    'batch.errors': 'Some files could not be processed:',
    'batch.clear': 'Clear batch',
    'settings.resetDefaults': 'Reset to defaults',
    'settings.invalidBudget': 'Enter a whole number from 100 to 1,000,000.',
    'main.subtitle': 'Break down large prompts into manageable chunks for any AI model',
    'main.yourPrompt': 'Your Long Prompt',
    'main.uploadFile': 'Upload File',
    'main.placeholder': 'Paste your long prompt here... You can also upload a .txt or .md file.',
    'main.tokens': 'tokens',
    'main.max': 'max',
    'main.words': 'Words',
    'main.characters': 'Characters',
    'main.exceedsLimit': 'Your prompt exceeds the token limit. Splitting is recommended.',
    'main.uploadFileTooltip': 'Upload File',
    'main.supportedFormats': 'Supported formats: .txt, .md, .text, .markdown',
    'main.maxFileSize': 'Max file size: 5 MB (processed in browser)',
    'main.uploadFileAria': 'Upload a text file',
    'main.readyToSplit': 'Ready to Split',
    'main.readyToSplitDesc': 'Click "Split Prompt" or press Ctrl+Enter to divide your text into manageable parts. Each part will be formatted for easy copying into your AI chat.',
    
    // Buttons
    'button.templates': 'Templates',
    'button.history': 'History',
    'button.settings': 'Settings',
    'button.batch': 'Batch',
    'button.shortcuts': 'Shortcuts',
    'button.split': 'Split Prompt',
    'button.preview': 'Preview Split',
    'button.clear': 'Clear',
    'button.copy': 'Copy',
    'button.copyAll': 'Copy All Parts',
    'button.copied': 'Copied!',
    'button.download': 'Download .txt',
    'button.export': 'Export JSON',
    'button.clearPreview': 'Clear Preview',
    
    // Preview
    'preview.title': 'Split Preview',
    'preview.description': 'Your prompt will be divided into {count} parts. Each part is shown below with its estimated token count.',
    'preview.part': 'Part',
    'preview.of': 'of',
    
    // Settings
    'settings.title': 'Split Settings',
    'settings.aiPresets': 'AI Model Presets',
    'settings.maxTokens': 'Maximum Tokens per Part',
    'settings.recommended': 'Chunk budgets are CutPrompts suggestions, independent of official model limits.',
    'settings.splitMethod': 'Split Method',
    'settings.smartTokens': 'Smart Tokens',
    'settings.smartTokensDesc': 'Best for most cases',
    'settings.characters': 'Characters',
    'settings.charactersDesc': 'Simple split by length',
    'settings.paragraphs': 'Paragraphs',
    'settings.paragraphsDesc': 'Keep paragraphs intact',
    'settings.sentences': 'Sentences',
    'settings.sentencesDesc': 'Split by sentences',
    'settings.customDelimiter': 'Custom Delimiter (Optional)',
    'settings.delimiterPlaceholder': 'e.g., --- or % % % or custom text',
    'settings.delimiterNote': 'If set, text will be split at this delimiter instead of using the split method',
    'settings.proTips': 'Pro Tips:',
    'settings.tip1': 'Smart Tokens prefers natural breaks using a local token estimate',
    'settings.tip2': 'Lower max tokens = more parts but safer splitting',
    'settings.tip3': 'Custom delimiters are perfect for pre-marked sections',
    
    // Results
    'results.title': 'Split Results',
    'results.complete': '✨ Split Complete!',
    'results.description': 'Your prompt has been divided into {count} parts. Copy each part and send them to your AI assistant in order. Wait for "Received part X/{count}" before sending the next one.',
    'results.howToUse': '📋 How to Use:',
    'results.step1': 'Copy Part 1 and paste it into your AI chat (ChatGPT, Claude, Gemini, etc.)',
    'results.step2': 'Wait for the AI to respond with "Received part 1/{count}"',
    'results.step3': 'Continue with each part until all parts are sent',
    'results.step4': 'After sending the last part, tell the AI "ALL PARTS SENT"',
    'results.step5': 'Then the AI will process your complete prompt and answer your requests',
    'results.part': 'Part',
    'results.of': 'of',
    
    // Footer
    'footer.kofi': 'Support me on Ko-fi',
    'footer.by': 'By',
    'footer.visits': 'Visit count',
    'footer.visitsLoading': 'Visit count: loading…',
    'footer.visitsUnavailable': 'Visit count: unavailable',
    'footer.madeWith': 'Made with',
    'footer.for': 'for AI enthusiasts worldwide',
    'footer.compatible': 'Compatible with ChatGPT, Claude, Gemini, Llama, Mistral, and all major AI models',
    'footer.compatibleWith': 'Compatible With',
    'footer.tagline': 'Free, secure prompt splitter tool',
    'footer.secure': 'Secure',
    'footer.fast': 'Fast',
    'footer.free': '100% Free',
    'footer.rights': 'All rights reserved.',
    'footer.features': 'Features',
    'footer.feature1': 'Smart Token Counting',
    'footer.feature2': 'Batch Processing',
    'footer.feature3': 'Prompt Templates',
    'footer.feature4': 'History Management',
    'footer.developer': 'Developer',
    'footer.terms': 'Terms',
    'footer.privacy': 'Privacy',
    'footer.security': 'Security',

    
    // How to Use
    'howto.title': 'How to Use CutPrompts',
    'howto.quickStart': 'Quick Start',
    'howto.step1': 'Paste or upload your long prompt',
    'howto.step2': 'Choose your AI model preset or set custom token limit',
    'howto.step3': 'Click "Split Prompt" and copy each part to your AI chat',
    'howto.features': 'Features Guide',
    'howto.feature1': 'Smart Splitting',
    'howto.feature1Desc': 'Automatically splits at natural breakpoints (paragraphs, sentences) to maintain context',
    'howto.feature2': 'AI Model Presets',
    'howto.feature2Desc': 'Pre-configured token limits for ChatGPT, Claude, Gemini, Llama, Mistral, and more',
    'howto.feature3': 'Batch Processing',
    'howto.feature3Desc': 'Upload multiple files and split them all at once',
    'howto.feature4': 'History & Templates',
    'howto.feature4Desc': 'Save your splits and reuse common prompt templates',
    'howto.proTips': 'Pro Tips',
    'howto.tip1': 'Use Ctrl+Enter to quickly split your prompt',
    'howto.tip2': 'Export all parts as a single file for easy sharing',
    'howto.tip3': 'Custom delimiters let you control exactly where splits happen',
    'howto.unlimited': 'Unlimited & Free',
    'howto.unlimitedDesc': 'No sign-up required. No usage limits. Completely free forever. All processing happens in your browser.',
    
    // Batch Processor
    'batch.title': 'Batch File Processing',
    'batch.uploadLabel': 'Click to upload',
    'batch.dragDrop': 'or drag and drop',
    'batch.supportedFormats': 'TXT, MD files (multiple files supported)',
    'batch.processing': 'Processing files...',
    'batch.processedFiles': 'Processed Files ({count})',
    'batch.downloadAll': 'Download All',
    'batch.download': 'Download',
    'batch.remove': 'Remove',
    'batch.noFiles': 'No files uploaded yet',
    'batch.noFilesDesc': 'Upload multiple text files to split them all at once',
    'batch.tip': 'Tip:',
    'batch.tipDesc': 'All files will be split using your current settings ({maxTokens} tokens, {splitMethod} method). Change settings before uploading for different results.',
    
    // Templates Panel
    'templates.title': 'Prompt Templates',
    'templates.searchPlaceholder': 'Search templates...',
    'templates.noResults': 'No templates found matching your search.',
    'templates.categories.all': 'All',
    'templates.categories.research': 'Research',
    'templates.categories.writing': 'Writing',
    'templates.categories.development': 'Development',
    'templates.categories.analysis': 'Analysis',
    'templates.categories.creative': 'Creative',
    'templates.categories.education': 'Education',
    
    // Template Names and Descriptions
    'templates.analysis.name': 'Data Analysis',
    'templates.analysis.description': 'For analyzing large datasets or documents',
    'templates.research.name': 'Research Analysis',
    'templates.research.description': 'Multi-part research question template',
    'templates.writing.name': 'Long-form Writing',
    'templates.writing.description': 'Template for book chapters, articles, essays',
    'templates.coding.name': 'Code Review & Refactoring',
    'templates.coding.description': 'For reviewing and improving large codebases',
    'templates.data.name': 'Data Analysis',
    'templates.data.description': 'For analyzing large datasets or documents',
    'templates.brainstorm.name': 'Brainstorming Session',
    'templates.brainstorm.description': 'For creative ideation and problem-solving',
    'templates.tutorial.name': 'Learning Tutorial',
    'templates.tutorial.description': 'For creating step-by-step learning materials',
    
    // History Panel
    'history.title': 'Recent History',
    'history.noHistory': 'No saved prompts yet. Use “Save to History” to store a prompt on this device.',
    'history.export': 'Export history',
    'history.import': 'Import history',
    'history.clearAll': 'Clear all history',
    'history.confirmClear': 'Are you sure you want to clear all history?',
    'history.parts': 'parts',
    'history.importSuccess': 'History imported successfully!',
    'history.importError': 'Failed to import history. Invalid file format.',
    
    // AI Model Names and Descriptions
    'aiModels.gpt4turbo.name': 'GPT-4 Turbo',
    'aiModels.gpt4turbo.description': 'Latest GPT-4 with extended context',
    'aiModels.gpt4.name': 'GPT-4',
    'aiModels.gpt4.description': 'Most capable GPT model',
    'aiModels.gpt35turbo.name': 'GPT-3.5 Turbo',
    'aiModels.gpt35turbo.description': 'Fast and efficient',
    'aiModels.gpt35.name': 'GPT-3.5',
    'aiModels.gpt35.description': 'Standard GPT-3.5',
    'aiModels.claude35sonnet.name': 'Claude 3.5 Sonnet',
    'aiModels.claude35sonnet.description': 'Latest Claude with 200K context',
    'aiModels.claude3opus.name': 'Claude 3 Opus',
    'aiModels.claude3opus.description': 'Most powerful Claude model',
    'aiModels.claude3sonnet.name': 'Claude 3 Sonnet',
    'aiModels.claude3sonnet.description': 'Balanced performance',
    'aiModels.claude3haiku.name': 'Claude 3 Haiku',
    'aiModels.claude3haiku.description': 'Fast and compact',
    'aiModels.gemini15pro.name': 'Gemini 1.5 Pro',
    'aiModels.gemini15pro.description': 'Latest Gemini with 1M context',
    'aiModels.geminipro.name': 'Gemini Pro',
    'aiModels.geminipro.description': 'Google\'s advanced AI',
    'aiModels.geminiultra.name': 'Gemini Ultra',
    'aiModels.geminiultra.description': 'Most capable Gemini',
    'aiModels.llama370b.name': 'Llama 3 70B',
    'aiModels.llama370b.description': 'Latest Llama 3 model',
    'aiModels.llama38b.name': 'Llama 3 8B',
    'aiModels.llama38b.description': 'Efficient Llama 3',
    'aiModels.llama270b.name': 'Llama 2 70B',
    'aiModels.llama270b.description': 'Open-source powerhouse',
    'aiModels.mistrallarge.name': 'Mistral Large',
    'aiModels.mistrallarge.description': 'European AI excellence',
    'aiModels.mistralmedium.name': 'Mistral Medium',
    'aiModels.mistralmedium.description': 'Balanced Mistral model',
    'aiModels.mistralsmall.name': 'Mistral Small',
    'aiModels.mistralsmall.description': 'Fast Mistral model',
    'aiModels.chatgptsafe.name': 'ChatGPT Safe',
    'aiModels.chatgptsafe.description': 'Safe for most ChatGPT models',
    'aiModels.claudesafe.name': 'Claude Safe',
    'aiModels.claudesafe.description': 'Safe for Claude models',
    'aiModels.generalsafe.name': 'General Safe',
    'aiModels.generalsafe.description': 'Universal safe limit',
    'aiModels.custom.name': 'Custom',
    'aiModels.custom.description': 'Set your own token limit',
    
    // AI Model Providers
    'aiProviders.openai': 'OpenAI',
    'aiProviders.anthropic': 'Anthropic',
    'aiProviders.google': 'Google',
    'aiProviders.meta': 'Meta',
    'aiProviders.mistral': 'Mistral AI',
    'aiProviders.mistralai': 'Mistral AI',
    'aiProviders.recommended': 'Recommended',
    'aiProviders.custom': 'Custom',
  },
  vi: {
    // Header
    'header.title': 'CutPrompts',
    'header.subtitle': 'Công cụ chia prompt miễn phí & không giới hạn cho mọi mô hình AI',
    'header.howToUse': 'Hướng Dẫn',
    
    // Privacy Policy
    'privacy.title': 'Chính Sách Quyền Riêng Tư',
    'privacy.introduction': 'Giới thiệu',
    'privacy.introText': 'CutPrompts tôn trọng quyền riêng tư của bạn. Chính sách này giải thích cách chúng tôi xử lý thông tin khi bạn sử dụng trang web và dịch vụ của chúng tôi.',
    'privacy.dataCollection': 'Thông tin chúng tôi thu thập',
    'privacy.noDataCollected': 'Nội dung prompt và kết quả chia được xử lý trong trình duyệt. Website cũng dùng dịch vụ phân tích và bộ đếm lượt truy cập như mô tả bên dưới. CutPrompts không hiển thị quảng cáo.',
    'privacy.noAccountRequired': 'Bạn có thể chia prompt mà không cần tạo tài khoản.',
    'privacy.noPersonalInfo': 'Bạn không cần gửi thông tin cá nhân hoặc nội dung prompt để sử dụng công cụ chia prompt.',
    'privacy.noTracking': 'Google Analytics có thể xử lý dữ liệu thiết bị và việc sử dụng website theo chính sách riêng.',
    'privacy.clientSideOnly': 'Việc chia prompt, xem trước và lịch sử prompt lưu cục bộ diễn ra trên thiết bị. Bộ đếm gửi mã phiên ngẫu nhiên tới máy chủ.',
    'privacy.cookies': 'Cookie và công nghệ theo dõi',
    'privacy.cookieUsage': 'Chúng tôi lưu ngôn ngữ, giao diện và cài đặt chia prompt trong bộ nhớ trình duyệt. Google Analytics có thể dùng cookie hoặc công nghệ tương tự theo chính sách riêng và quy định về sự đồng ý.',
    'privacy.thirdParty': 'Dịch vụ bên thứ ba',
    'privacy.thirdPartyServices': 'Website sử dụng Google Analytics để thống kê, Vercel để lưu trữ và Upstash để lưu bộ đếm. Khi nhấn Ko-fi, bạn sẽ chuyển tới website bên thứ ba. Hãy tham khảo chính sách quyền riêng tư của từng nhà cung cấp.',
    'privacy.analytics': 'Phân tích lượt truy cập',
    'privacy.analyticsInfo': 'CutPrompts không phân phối quảng cáo. Google Analytics thống kê việc sử dụng website và có thể xử lý dữ liệu theo chính sách của Google cùng các yêu cầu về sự đồng ý áp dụng.',
    'privacy.security': 'Bảo mật',
    'privacy.securityMeasures': 'API đếm truy cập không nhận nội dung prompt. API lưu tạm mã phiên ngẫu nhiên để tránh đếm trùng và lưu tổng lượt truy cập. Các nhà cung cấp hạ tầng có thể xử lý nhật ký yêu cầu.',
    'privacy.changes': 'Thay đổi chính sách',
    'privacy.policyChanges': 'Chính sách này có thể được cập nhật theo thời gian. Mọi thay đổi sẽ được đăng trên trang này.',
    
    // Terms of Service
    'terms.title': 'Điều Khoản Dịch Vụ',
    'terms.acceptance': 'Chấp nhận điều khoản',
    'terms.acceptanceText': 'Bằng việc truy cập hoặc sử dụng CutPrompts, bạn đồng ý với các Điều Khoản Dịch Vụ này và mọi luật, quy định liên quan.',
    'terms.useOfService': 'Sử dụng dịch vụ',
    'terms.useOfServiceText': 'Bạn đồng ý sử dụng CutPrompts một cách hợp pháp và phù hợp với các điều khoản sau. Bạn không được:',
    'terms.use1': 'Sử dụng dịch vụ cho mục đích trái pháp luật',
    'terms.use2': 'Cố gắng phân tích ngược, hack, hoặc gây gián đoạn dịch vụ',
    'terms.use3': 'Dùng công cụ tự động hoặc bot để truy cập dịch vụ',
    'terms.use4': 'Lạm dụng, gây quá tải, hoặc can thiệp vào hệ thống',
    'terms.intellectualProperty': 'Sở hữu trí tuệ',
    'terms.intellectualPropertyText': 'Tên CutPrompts và các tài sản gốc của dự án gắn với LOHUX. Nhãn hiệu, thư viện và nội dung của bên thứ ba hoặc người đóng góp vẫn thuộc về chủ sở hữu và bên cấp phép tương ứng.',
    'terms.thirdPartyServices': 'Dịch vụ bên thứ ba',
    'terms.thirdPartyServicesText': 'CutPrompts miễn phí và không có quảng cáo. Website sử dụng Vercel để lưu trữ, Google Analytics để thống kê và Upstash cho bộ đếm khi được cấu hình. Ko-fi là liên kết ủng hộ tự nguyện bên ngoài. Các dịch vụ bên thứ ba có chính sách riêng.',
    'terms.limitation': 'Giới hạn trách nhiệm',
    'terms.limitationText': 'CutPrompts được cung cấp "như hiện có" và không có bất kỳ đảm bảo nào. Chúng tôi không chịu trách nhiệm cho mọi thiệt hại hoặc mất mát phát sinh từ việc sử dụng dịch vụ.',
    'terms.changes': 'Thay đổi điều khoản',
    'terms.changesText': 'Chúng tôi có thể cập nhật các Điều Khoản này theo thời gian. Việc bạn tiếp tục sử dụng dịch vụ đồng nghĩa với việc bạn chấp nhận các điều khoản đã được cập nhật.',
    
    // Main
    'main.title': 'Chia Prompt Dài Của Bạn',
    'notice.delimiterMissing': 'Không tìm thấy dấu phân cách. Đã dùng phương pháp và giới hạn chia hiện tại.',
    'notice.saved': 'Đã lưu vào lịch sử trên thiết bị này.',
    'notice.saveFailed': 'Không thể lưu: bộ nhớ đầy hoặc prompt dài hơn 500.000 ký tự.',
    'notice.historyTooltip': 'Lưu prompt này vào lịch sử của trình duyệt trên thiết bị',
    'notice.clipboardDenied': 'Không có quyền truy cập bộ nhớ tạm. Hãy chọn và sao chép thủ công hoặc tải tệp về.',
    'notice.invalidFormat': 'Hãy chọn tệp TXT hoặc Markdown.',
    'notice.fileTooLarge': 'Kích thước tệp tối đa là 5 MB.',
    'notice.invalidUtf8': 'Không thể đọc tệp này ở định dạng UTF-8.',
    'notice.estimated': 'ước tính',
    'button.saveHistory': 'Lưu lịch sử',
    'batch.filesLimit': 'Tối đa 10 tệp mỗi lượt, mỗi tệp tối đa 1 MB (UTF-8).',
    'batch.errors': 'Một số tệp không thể xử lý:',
    'batch.clear': 'Xóa danh sách',
    'settings.resetDefaults': 'Khôi phục cài đặt mặc định',
    'settings.invalidBudget': 'Hãy nhập số nguyên từ 100 đến 1.000.000.',
    'main.subtitle': 'Chia nhỏ prompt lớn thành các phần dễ quản lý cho bất kỳ mô hình AI nào',
    'main.yourPrompt': 'Prompt Dài Của Bạn',
    'main.uploadFile': 'Tải File Lên',
    'main.placeholder': 'Dán prompt dài của bạn vào đây... Bạn cũng có thể tải lên file .txt hoặc .md.',
    'main.tokens': 'tokens',
    'main.max': 'tối đa',
    'main.words': 'Từ',
    'main.characters': 'Ký tự',
    'main.exceedsLimit': 'Prompt của bạn vượt quá giới hạn token. Nên chia nhỏ.',
    'main.uploadFileTooltip': 'Tải File Lên',
    'main.supportedFormats': 'Định dạng hỗ trợ: .txt, .md, .text, .markdown',
    'main.maxFileSize': 'Kích thước tối đa: 5 MB (xử lý trong trình duyệt)',
    'main.uploadFileAria': 'Tải lên file văn bản',
    'main.readyToSplit': 'Sẵn Sàng Chia',
    'main.readyToSplitDesc': 'Nhấp "Chia Prompt" hoặc nhấn Ctrl+Enter để chia văn bản của bạn thành các phần dễ quản lý. Mỗi phần sẽ được định dạng để dễ dàng sao chép vào chat AI của bạn.',
    
    // Buttons
    'button.templates': 'Mẫu',
    'button.history': 'Lịch Sử',
    'button.settings': 'Cài Đặt',
    'button.batch': 'Hàng Loạt',
    'button.shortcuts': 'Phím Tắt',
    'button.split': 'Chia Prompt',
    'button.preview': 'Xem Trước Chia',
    'button.clear': 'Xóa',
    'button.copy': 'Sao Chép',
    'button.copyAll': 'Sao Chép Tất Cả Phần',
    'button.copied': 'Đã Sao Chép!',
    'button.download': 'Tải Xuống .txt',
    'button.export': 'Xuất JSON',
    'button.clearPreview': 'Xóa Xem Trước',
    
    // Preview
    'preview.title': 'Xem Trước Chia',
    'preview.description': 'Prompt của bạn sẽ được chia thành {count} phần. Mỗi phần được hiển thị dưới đây cùng với số token ước lượng.',
    'preview.part': 'Phần',
    'preview.of': 'của',
    
    // Settings
    'settings.title': 'Cài Đặt Chia',
    'settings.aiPresets': 'Cài Đặt Sẵn Mô Hình AI',
    'settings.maxTokens': 'Số Token Tối Đa Mỗi Phần',
    'settings.recommended': 'Ngân sách chia do CutPrompts đề xuất, độc lập với giới hạn chính thức của mô hình.',
    'settings.splitMethod': 'Phương Pháp Chia',
    'settings.smartTokens': 'Token Thông Minh',
    'settings.smartTokensDesc': 'Tốt nhất cho hầu hết trường hợp',
    'settings.characters': 'Ký Tự',
    'settings.charactersDesc': 'Chia đơn giản theo độ dài',
    'settings.paragraphs': 'Đoạn Văn',
    'settings.paragraphsDesc': 'Giữ nguyên đoạn văn',
    'settings.sentences': 'Câu',
    'settings.sentencesDesc': 'Chia theo câu',
    'settings.customDelimiter': 'Dấu Phân Cách Tùy Chỉnh (Tùy Chọn)',
    'settings.delimiterPlaceholder': 'vd: --- hoặc % % % hoặc văn bản tùy chỉnh',
    'settings.delimiterNote': 'Nếu được đặt, văn bản sẽ được chia tại dấu phân cách này thay vì sử dụng phương pháp chia',
    'settings.proTips': 'Mẹo Chuyên Nghiệp:',
    'settings.tip1': 'Token thông minh ưu tiên điểm ngắt tự nhiên dựa trên ước tính token cục bộ',
    'settings.tip2': 'Token tối đa thấp hơn = nhiều phần hơn nhưng chia an toàn hơn',
    'settings.tip3': 'Dấu phân cách tùy chỉnh hoàn hảo cho các phần đã đánh dấu trước',
    
    // Results
    'results.title': 'Kết Quả Chia',
    'results.complete': '✨ Chia Hoàn Tất!',
    'results.description': 'Prompt của bạn đã được chia thành {count} phần. Sao chép từng phần và gửi chúng cho trợ lý AI của bạn theo thứ tự. Chờ "Đã nhận phần X/{count}" trước khi gửi phần tiếp theo.',
    'results.howToUse': '📋 Cách Sử Dụng:',
    'results.step1': 'Sao chép Phần 1 và dán nó vào cuộc trò chuyện AI của bạn (ChatGPT, Claude, Gemini, v.v.)',
    'results.step2': 'Chờ AI phản hồi bằng "Đã nhận phần 1/{count}"',
    'results.step3': 'Tiếp tục với từng phần cho đến khi tất cả các phần được gửi',
    'results.step4': 'Sau khi gửi phần cuối cùng, hãy nói với AI "ALL PARTS SENT"',
    'results.step5': 'Sau đó AI sẽ xử lý prompt hoàn chỉnh của bạn và trả lời các yêu cầu của bạn',
    'results.part': 'Phần',
    'results.of': 'của',
    
    // Footer
    'footer.kofi': 'Ủng hộ qua Ko-fi',
    'footer.by': 'Bởi',
    'footer.visits': 'Lượt truy cập',
    'footer.visitsLoading': 'Lượt truy cập: đang tải…',
    'footer.visitsUnavailable': 'Lượt truy cập: chưa khả dụng',
    'footer.madeWith': 'Được tạo với',
    'footer.for': 'cho cộng đồng AI toàn cầu',
    'footer.compatible': 'Tương thích với ChatGPT, Claude, Gemini, Llama, Mistral và tất cả các mô hình AI chính',
    'footer.compatibleWith': 'Tương Thích Với',
    'footer.tagline': 'Công cụ chia prompt miễn phí, bảo mật',
    'footer.secure': 'Bảo Mật',
    'footer.fast': 'Nhanh Chóng',
    'footer.free': '100% Miễn Phí',
    'footer.rights': 'Bảo lưu mọi quyền.',
    'footer.features': 'Tính Năng',
    'footer.feature1': 'Đếm Token Thông Minh',
    'footer.feature2': 'Xử Lý Hàng Loạt',
    'footer.feature3': 'Mẫu Prompt',
    'footer.feature4': 'Quản Lý Lịch Sử',
    'footer.developer': 'Nhà Phát Triển',
    'footer.terms': 'Điều Khoản',
    'footer.privacy': 'Bảo Mật',
    'footer.security': 'Bảo Mật',

    
    // How to Use
    'howto.title': 'Cách Sử Dụng CutPrompts',
    'howto.quickStart': 'Bắt Đầu Nhanh',
    'howto.step1': 'Dán hoặc tải lên prompt dài của bạn',
    'howto.step2': 'Chọn cài đặt sẵn mô hình AI hoặc đặt giới hạn token tùy chỉnh',
    'howto.step3': 'Nhấp "Chia Prompt" và sao chép từng phần vào chat AI của bạn',
    'howto.features': 'Hướng Dẫn Tính Năng',
    'howto.feature1': 'Chia Thông Minh',
    'howto.feature1Desc': 'Tự động chia tại các điểm ngắt tự nhiên (đoạn văn, câu) để duy trì ngữ cảnh',
    'howto.feature2': 'Cài Đặt Sẵn Mô Hình AI',
    'howto.feature2Desc': 'Giới hạn token được cấu hình sẵn cho ChatGPT, Claude, Gemini, Llama, Mistral và nhiều hơn nữa',
    'howto.feature3': 'Xử Lý Hàng Loạt',
    'howto.feature3Desc': 'Tải lên nhiều file và chia tất cả cùng một lúc',
    'howto.feature4': 'Lịch Sử & Mẫu',
    'howto.feature4Desc': 'Lưu các lần chia của bạn và tái sử dụng các mẫu prompt phổ biến',
    'howto.proTips': 'Mẹo Chuyên Nghiệp',
    'howto.tip1': 'Sử dụng Ctrl+Enter để nhanh chóng chia prompt của bạn',
    'howto.tip2': 'Xuất tất cả các phần thành một file duy nhất để dễ dàng chia sẻ',
    'howto.tip3': 'Dấu phân cách tùy chỉnh cho phép bạn kiểm soát chính xác nơi chia',
    'howto.unlimited': 'Không Giới Hạn & Miễn Phí',
    'howto.unlimitedDesc': 'Không cần đăng ký. Không giới hạn sử dụng. Hoàn toàn miễn phí mãi mãi. Tất cả xử lý diễn ra trong trình duyệt của bạn.',
    
    // Batch Processor
    'batch.title': 'Xử Lý Hàng Loạt',
    'batch.uploadLabel': 'Nhấp để tải lên',
    'batch.dragDrop': 'hoặc kéo và thả',
    'batch.supportedFormats': 'Tập tin TXT, MD (hỗ trợ nhiều tập tin)',
    'batch.processing': 'Đang xử lý tập tin...',
    'batch.processedFiles': 'Tập Tin Đã Xử Lý ({count})',
    'batch.downloadAll': 'Tải Xuống Tất Cả',
    'batch.download': 'Tải Xuống',
    'batch.remove': 'Xóa',
    'batch.noFiles': 'Chưa có tập tin nào được tải lên',
    'batch.noFilesDesc': 'Tải lên nhiều tập tin văn bản để chia tất cả cùng lúc',
    'batch.tip': 'Mẹo:',
    'batch.tipDesc': 'Tất cả các tập tin sẽ được chia bằng cài đặt hiện tại của bạn ({maxTokens} token, phương pháp {splitMethod}). Thay đổi cài đặt trước khi tải lên để có kết quả khác.',
    
    // Templates Panel
    'templates.title': 'Mẫu Prompt',
    'templates.searchPlaceholder': 'Tìm kiếm mẫu...',
    'templates.noResults': 'Không tìm thấy mẫu nào phù hợp.',
    'templates.categories.all': 'Tất cả',
    'templates.categories.research': 'Nghiên cứu',
    'templates.categories.writing': 'Viết lách',
    'templates.categories.development': 'Phát triển',
    'templates.categories.analysis': 'Phân tích',
    'templates.categories.creative': 'Sáng tạo',
    'templates.categories.education': 'Giáo dục',
    
    // Template Names and Descriptions
    'templates.analysis.name': 'Phân tích Dữ liệu',
    'templates.analysis.description': 'Để phân tích tập dữ liệu hoặc tài liệu lớn',
    'templates.research.name': 'Phân tích Nghiên cứu',
    'templates.research.description': 'Mẫu câu hỏi nghiên cứu nhiều phần',
    'templates.writing.name': 'Viết dài',
    'templates.writing.description': 'Mẫu cho chương sách, bài viết, luận văn',
    'templates.coding.name': 'Xem xét & Tái cấu trúc Mã',
    'templates.coding.description': 'Để xem xét và cải thiện cơ sở mã lớn',
    'templates.data.name': 'Phân tích Dữ liệu',
    'templates.data.description': 'Để phân tích tập dữ liệu hoặc tài liệu lớn',
    'templates.brainstorm.name': 'Phiên Não công',
    'templates.brainstorm.description': 'Để tạo ý tưởng sáng tạo và giải quyết vấn đề',
    'templates.tutorial.name': 'Hướng dẫn Học tập',
    'templates.tutorial.description': 'Để tạo tài liệu học tập từng bước',
    
    // History Panel
    'history.title': 'Lịch Sử Gần Đây',
    'history.noHistory': 'Chưa có prompt được lưu. Dùng “Lưu lịch sử” để lưu prompt trên thiết bị này.',
    'history.export': 'Xuất lịch sử',
    'history.import': 'Nhập lịch sử',
    'history.clearAll': 'Xóa toàn bộ lịch sử',
    'history.confirmClear': 'Bạn có chắc chắn muốn xóa toàn bộ lịch sử?',
    'history.parts': 'phần',
    'history.importSuccess': 'Lịch sử đã được nhập thành công!',
    'history.importError': 'Không thể nhập lịch sử. Định dạng tệp không hợp lệ.',
    
    // AI Model Names and Descriptions
    'aiModels.gpt4turbo.name': 'GPT-4 Turbo',
    'aiModels.gpt4turbo.description': 'GPT-4 mới nhất với ngữ cảnh mở rộng',
    'aiModels.gpt4.name': 'GPT-4',
    'aiModels.gpt4.description': 'Mô hình GPT mạnh nhất',
    'aiModels.gpt35turbo.name': 'GPT-3.5 Turbo',
    'aiModels.gpt35turbo.description': 'Nhanh và hiệu quả',
    'aiModels.gpt35.name': 'GPT-3.5',
    'aiModels.gpt35.description': 'GPT-3.5 tiêu chuẩn',
    'aiModels.claude35sonnet.name': 'Claude 3.5 Sonnet',
    'aiModels.claude35sonnet.description': 'Claude mới nhất với ngữ cảnh 200K',
    'aiModels.claude3opus.name': 'Claude 3 Opus',
    'aiModels.claude3opus.description': 'Mô hình Claude mạnh nhất',
    'aiModels.claude3sonnet.name': 'Claude 3 Sonnet',
    'aiModels.claude3sonnet.description': 'Hiệu suất cân bằng',
    'aiModels.claude3haiku.name': 'Claude 3 Haiku',
    'aiModels.claude3haiku.description': 'Nhanh và gọn nhẹ',
    'aiModels.gemini15pro.name': 'Gemini 1.5 Pro',
    'aiModels.gemini15pro.description': 'Gemini mới nhất với ngữ cảnh 1M',
    'aiModels.geminipro.name': 'Gemini Pro',
    'aiModels.geminipro.description': 'AI tiên tiến của Google',
    'aiModels.geminiultra.name': 'Gemini Ultra',
    'aiModels.geminiultra.description': 'Gemini mạnh nhất',
    'aiModels.llama370b.name': 'Llama 3 70B',
    'aiModels.llama370b.description': 'Mô hình Llama 3 mới nhất',
    'aiModels.llama38b.name': 'Llama 3 8B',
    'aiModels.llama38b.description': 'Llama 3 hiệu quả',
    'aiModels.llama270b.name': 'Llama 2 70B',
    'aiModels.llama270b.description': 'Mã nguồn mở mạnh mẽ',
    'aiModels.mistrallarge.name': 'Mistral Large',
    'aiModels.mistrallarge.description': 'AI châu Âu xuất sắc',
    'aiModels.mistralmedium.name': 'Mistral Medium',
    'aiModels.mistralmedium.description': 'Mô hình Mistral cân bằng',
    'aiModels.mistralsmall.name': 'Mistral Small',
    'aiModels.mistralsmall.description': 'Mô hình Mistral nhanh',
    'aiModels.chatgptsafe.name': 'ChatGPT An toàn',
    'aiModels.chatgptsafe.description': 'An toàn cho hầu hết các mô hình ChatGPT',
    'aiModels.claudesafe.name': 'Claude An toàn',
    'aiModels.claudesafe.description': 'An toàn cho các mô hình Claude',
    'aiModels.generalsafe.name': 'Chung An toàn',
    'aiModels.generalsafe.description': 'Giới hạn an toàn phổ quát',
    'aiModels.custom.name': 'Tùy chỉnh',
    'aiModels.custom.description': 'Đặt giới hạn token của riêng bạn',
    
    // AI Model Providers
    'aiProviders.openai': 'OpenAI',
    'aiProviders.anthropic': 'Anthropic',
    'aiProviders.google': 'Google',
    'aiProviders.meta': 'Meta',
    'aiProviders.mistral': 'Mistral AI',
    'aiProviders.mistralai': 'Mistral AI',
    'aiProviders.recommended': 'Khuyến nghị',
    'aiProviders.custom': 'Tùy chỉnh',
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(detectUserLanguage);

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    const url = new URL(window.location.href);
    if (lang === 'vi') url.searchParams.set('lang', 'vi');
    else url.searchParams.delete('lang');
    window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
  };

  const t = (key: string): string => {
    const langTranslations = translations[language];
    return langTranslations[key as keyof typeof langTranslations] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
