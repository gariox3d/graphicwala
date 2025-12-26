import { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { MessageCircle, Send, Bot, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { WHATSAPP_NUMBER, BUSINESS_NAME } from '@/lib/types';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

// Intent detection keywords
const INTENTS = {
  product: {
    keywords: ['photo frame', 'frame', 'keychain', 'pvc card', 'id card', 'visiting card', 'card', 'product', 'item', 'gift', 'print'],
    response: `🖼️ Hamare popular products:

• **Photo Frames** - Apni pasand ki photo frame banwa sakte ho
• **PVC Cards** - Durable plastic cards
• **ID Cards** - Office/School ke liye perfect
• **Visiting Cards** - Professional business cards
• **Keychains** - Custom photo keychains

Har product me apni photo upload karni hoti hai. Kuch products me front + back dono photo lagti hai.

👉 Products dekhne ke liye: [Products Page](/products) pe jaayein`
  },
  price: {
    keywords: ['price', 'rate', 'cost', 'kitna', 'paisa', 'rupees', 'rs', 'amount', 'charge', 'fees', 'kharcha'],
    response: `💰 **Price Information:**

Har product ki alag price hai jo product page pe clearly dikhti hai.

• Product price + Delivery charge = Total amount
• Delivery charge Bihar ke andar ₹40-80 ke beech hota hai
• Kuch products me pickup free bhi hai

👉 Exact price dekhne ke liye product page check karein!`
  },
  delivery: {
    keywords: ['delivery', 'bihar', 'kab milega', 'time', 'shipping', 'ship', 'days', 'din', 'pahunchega', 'address', 'location'],
    response: `🚚 **Delivery Details:**

✅ **Delivery sirf Bihar me available hai**
📍 Bihar ke kisi bhi district me deliver hota hai

⏱️ **Delivery Time:**
• Order confirm hone ke baad 3-5 working days
• Design approval ke baad printing start hoti hai

🏪 **Store Pickup Option:**
Agar aap Patna me ho, toh store se bhi le sakte ho (free pickup)

❌ Bihar ke bahar delivery available nahi hai`
  },
  payment: {
    keywords: ['cod', 'cash', 'payment', 'kaise pay', 'pay', 'razorpay', 'upi', 'online', 'paytm', 'gpay'],
    response: `💳 **Payment Information:**

❌ **COD (Cash on Delivery) available NAHI hai**

✅ **Sirf Prepaid Payment:**
• UPI (GPay, PhonePe, Paytm)
• Debit/Credit Card
• Net Banking

🔒 Payment secure hai - Razorpay use hota hai

Order place karte time photo upload karein, phir payment karein!`
  },
  upload: {
    keywords: ['photo upload', 'image', 'kaise upload', 'upload', 'photo kaise', 'design upload', 'file', 'pic', 'picture'],
    response: `📸 **Photo Upload Process:**

**Step 1:** Product select karein
**Step 2:** "Add to Cart" pe click karein
**Step 3:** Upload section me apni photo choose karein
**Step 4:** Preview dekho aur confirm karo

📌 **Important Tips:**
• High quality photo use karein
• Clear face wali photo best hoti hai
• Kuch products me front + back dono upload hota hai

❓ Upload me problem? WhatsApp pe baat karo!`
  },
  design: {
    keywords: ['design', 'bana doge', 'edit', 'help', 'customize', 'change', 'modify', 'template'],
    response: `🎨 **Design Help:**

Hum basic design support dete hain:
• Photo adjustment
• Text addition
• Background changes (limited)

**Complex designs ke liye:**
WhatsApp pe apni requirement bhejo, hum help karenge!

📱 WhatsApp: +91 6207142994

💡 Tip: Apna rough idea ya reference image bhejo toh better hoga!`
  },
  order: {
    keywords: ['order kaise', 'process', 'kaise order', 'buy', 'kharido', 'lena hai', 'mangwana', 'booking'],
    response: `🛒 **Order Process - Step by Step:**

**Step 1:** Products browse karein
**Step 2:** Pasand ka product select karein
**Step 3:** "Add to Cart" pe click karein
**Step 4:** Apni photo upload karein
**Step 5:** Cart me jaayein aur Checkout karein
**Step 6:** Address aur details bharein
**Step 7:** Payment complete karein ✅

Order confirm hone ke baad:
• Hum design prepare karenge
• WhatsApp pe preview bhejenge
• Approval ke baad printing start

🎉 Bas itna simple hai!`
  },
  greeting: {
    keywords: ['hi', 'hello', 'hey', 'namaste', 'kaise ho', 'hii', 'helloo', 'namaskar'],
    response: `Namaste! 🙏

Main ${BUSINESS_NAME} ka Smart Assistant hoon. Aapki kya help kar sakta hoon?

Aap mujhse pooch sakte ho:
• Products ke baare me
• Prices aur delivery
• Order process
• Photo upload help

Bataiye, kya jaanna hai? 😊`
  },
  thanks: {
    keywords: ['thanks', 'thank you', 'dhanyawad', 'shukriya', 'thnx', 'thx'],
    response: `Aapka swagat hai! 🙏

Agar aur kuch help chahiye toh baat karein. Hum yahan hain aapki help ke liye!

Happy shopping! 🎉`
  },
  contact: {
    keywords: ['contact', 'call', 'phone', 'number', 'whatsapp', 'baat', 'sampark'],
    response: `📞 **Contact Information:**

**WhatsApp & Call:**
📱 +91 6207142994

⏰ **Available:**
10 AM - 8 PM (Mon-Sat)

WhatsApp pe message karo, jaldi reply milega! 💬`
  }
};

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  text: `Namaste! 👋

Main **${BUSINESS_NAME} Smart Assistant** hoon.
Printing, gifts, order ya delivery se related kuch bhi pooch sakte ho! 😊

Neeche diye gaye questions pe click karke bhi pooch sakte ho.`,
  isBot: true,
  timestamp: new Date()
};

const QUICK_QUESTIONS = [
  "Keychain kaise order kare?",
  "Photo frame me photo kaise upload kare?",
  "Delivery Bihar me hoti hai?",
  "COD available hai?",
  "Price kitni hai?",
  "Design help chahiye"
];

const FALLBACK_RESPONSE = `Hmm, main is sawaal ka exact jawab nahi de paa raha 🤔

Lekin aap humare expert se baat kar sakte ho:

📱 **WhatsApp:** +91 6207142994

Woh aapki har problem solve kar denge! 💪`;

function detectIntent(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  for (const [, intent] of Object.entries(INTENTS)) {
    for (const keyword of intent.keywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        return intent.response;
      }
    }
  }
  
  return FALLBACK_RESPONSE;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

const AIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isInitialLoad = useRef(true);

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${BUSINESS_NAME}, I need help.`)}`;

  const scrollChatToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    // Skip auto-scroll on initial page load
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }
    // Only scroll the chat container, not the page
    scrollChatToBottom();
  }, [messages]);

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: generateId(),
      text: text.trim(),
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Generate bot response instantly
    const botResponse = detectIntent(text);
    const botMessage: Message = {
      id: generateId(),
      text: botResponse,
      isBot: true,
      timestamp: new Date()
    };

    // Instant reply (no fake loading)
    setMessages(prev => [...prev, botMessage]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  const handleQuickQuestion = (question: string) => {
    handleSendMessage(question);
  };

  // Parse markdown-like syntax for display - safe React components (no dangerouslySetInnerHTML)
  const formatMessage = (text: string) => {
    return text.split('\n').map((line, lineIndex) => {
      if (!line) return <p key={lineIndex} className="mb-1">&nbsp;</p>;
      
      // Parse line into segments (text, bold, links)
      const segments: React.ReactNode[] = [];
      let remaining = line;
      let segmentIndex = 0;
      
      while (remaining.length > 0) {
        // Check for bold text first
        const boldMatch = remaining.match(/\*\*(.*?)\*\*/);
        // Check for markdown links - only allow safe protocols (http, https, relative paths)
        const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);
        
        // Find the earliest match
        const boldIndex = boldMatch ? remaining.indexOf(boldMatch[0]) : -1;
        const linkIndex = linkMatch ? remaining.indexOf(linkMatch[0]) : -1;
        
        // No more matches, add remaining text
        if (boldIndex === -1 && linkIndex === -1) {
          segments.push(<span key={`${lineIndex}-${segmentIndex++}`}>{remaining}</span>);
          break;
        }
        
        // Determine which comes first
        const usesBold = boldIndex !== -1 && (linkIndex === -1 || boldIndex < linkIndex);
        const usesLink = linkIndex !== -1 && (boldIndex === -1 || linkIndex < boldIndex);
        
        if (usesBold && boldMatch) {
          // Add text before bold
          if (boldIndex > 0) {
            segments.push(<span key={`${lineIndex}-${segmentIndex++}`}>{remaining.substring(0, boldIndex)}</span>);
          }
          // Add bold text
          segments.push(<strong key={`${lineIndex}-${segmentIndex++}`}>{boldMatch[1]}</strong>);
          remaining = remaining.substring(boldIndex + boldMatch[0].length);
        } else if (usesLink && linkMatch) {
          // Add text before link
          if (linkIndex > 0) {
            segments.push(<span key={`${lineIndex}-${segmentIndex++}`}>{remaining.substring(0, linkIndex)}</span>);
          }
          // Validate URL - only allow safe protocols
          const url = linkMatch[2];
          const isSafeUrl = /^(https?:\/\/|\/[^/])/.test(url);
          
          if (isSafeUrl) {
            segments.push(
              <a 
                key={`${lineIndex}-${segmentIndex++}`} 
                href={url} 
                className="text-primary underline hover:no-underline"
              >
                {linkMatch[1]}
              </a>
            );
          } else {
            // Unsafe URL - just show the text without linking
            segments.push(<span key={`${lineIndex}-${segmentIndex++}`}>{linkMatch[1]}</span>);
          }
          remaining = remaining.substring(linkIndex + linkMatch[0].length);
        }
      }
      
      return <p key={lineIndex} className="mb-1">{segments}</p>;
    });
  };

  return (
    <>
      <Helmet>
        <title>Smart Assistant - {BUSINESS_NAME}</title>
        <meta name="description" content="24×7 Printing & Gift Help Desk. Get instant help with orders, delivery, payments and more." />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1 container py-6 max-w-3xl">
          {/* Page Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Smart Assistant</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              {BUSINESS_NAME} Smart Assistant
            </h1>
            <p className="text-muted-foreground">
              Your 24×7 Printing & Gift Help Desk
            </p>
          </div>

          {/* Chat Container */}
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 320px)', minHeight: '400px' }}>
            {/* Messages Area */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  {message.isBot && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.isBot
                        ? 'bg-muted text-foreground rounded-tl-sm'
                        : 'bg-primary text-primary-foreground rounded-tr-sm'
                    }`}
                  >
                    <div className="text-sm leading-relaxed">
                      {formatMessage(message.text)}
                    </div>
                  </div>
                  {!message.isBot && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Quick Questions */}
            {messages.length <= 2 && (
              <div className="px-4 py-3 border-t border-border bg-muted/30">
                <p className="text-xs text-muted-foreground mb-2">Quick questions:</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_QUESTIONS.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickQuestion(question)}
                      className="text-xs bg-background border border-border px-3 py-1.5 rounded-full hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-border bg-background">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Apna sawaal likhein..."
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={!inputValue.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>

          {/* WhatsApp CTA */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Complex query hai? Expert se baat karo:
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-medium transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              WhatsApp pe Chat karein
            </a>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default AIAssistant;
