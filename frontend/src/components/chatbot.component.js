import React, { Component } from 'react';

export default class Chatbot extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      isOpen: true, // Open by default
      messages: [
        {
          text: "Hi! I'm here to help you with common questions about Rentacube. Please choose a topic below:",
          sender: 'bot',
          timestamp: new Date(),
          showOptions: true
        }
      ],
      inputValue: '',
      isTyping: false,
      currentOptions: 'main' // main, pricing, account, support
    };

    // Option-based responses and navigation
    this.optionSets = {
      main: {
        options: [
          { id: 'how-it-works', text: '🏠 How does Rentacube work?', type: 'answer' },
          { id: 'pricing', text: '💰 Pricing & Payments', type: 'submenu' },
          { id: 'getting-started', text: '🚀 Getting Started', type: 'submenu' },
          { id: 'safety', text: '🛡️ Safety & Trust', type: 'answer' },
          { id: 'support', text: '❓ Contact Support', type: 'answer' }
        ]
      },
      pricing: {
        title: 'Pricing & Payments',
        options: [
          { id: 'how-pricing-works', text: 'How does pricing work?', type: 'answer' },
          { id: 'payment-methods', text: 'What payment methods are accepted?', type: 'answer' },
          { id: 'fees', text: 'Are there any fees?', type: 'answer' },
          { id: 'back-main', text: '← Back to main menu', type: 'back' }
        ]
      },
      'getting-started': {
        title: 'Getting Started',
        options: [
          { id: 'how-to-rent', text: 'How to rent an item', type: 'answer' },
          { id: 'how-to-list', text: 'How to list an item', type: 'answer' },
          { id: 'create-account', text: 'How to create an account', type: 'answer' },
          { id: 'categories', text: 'What can I rent?', type: 'answer' },
          { id: 'back-main', text: '← Back to main menu', type: 'back' }
        ]
      }
    };

    this.answers = {
      'how-it-works': "Rentacube is a platform where you can rent and list various items and services. Simply browse listings, contact owners, and book items directly through our platform. If you have items to rent out, you can create your own listings too!",
      'how-pricing-works': "Pricing varies by item and owner. Each listing shows the rental price, duration options, and any additional fees. You can see all costs upfront before booking.",
      'payment-methods': "Payment methods and terms are arranged directly between renters and owners. Details are specified in each listing. Most owners accept cash, bank transfers, or digital payments.",
      'fees': "Rentacube connects renters and owners for free! Any fees or deposits are set by individual listing owners and clearly shown in their listings.",
      'how-to-rent': "To rent an item:\n1️⃣ Browse or search for what you need\n2️⃣ View the listing details and photos\n3️⃣ Contact the owner through the platform\n4️⃣ Arrange booking, payment, and pickup/delivery",
      'how-to-list': "To list an item:\n1️⃣ Sign up or sign in to your account\n2️⃣ Click 'Create Listing'\n3️⃣ Add photos and detailed description\n4️⃣ Set your price and availability\n5️⃣ Publish your listing",
      'create-account': "Creating an account is free and easy! Just click the 'Sign Up' button in the top navigation, fill in your details, and you're ready to start renting or listing items.",
      'categories': "You can rent almost anything! We have categories including:\n🔧 Tools & Equipment\n📱 Electronics\n🚗 Vehicles\n🎉 Event Equipment\n⚽ Sports Gear\n🏠 Home & Garden\n...and much more!",
      'safety': "For your safety, we recommend:\n• Meet in public places for exchanges\n• Inspect items before renting\n• Communicate through our platform\n• Check ratings and reviews\n• Trust your instincts",
      'support': "Need help? You can:\n• Contact listing owners directly through their pages\n• Check our help section for common issues\n• Reach out to our support team for technical problems\n• Leave reviews to help other users"
    };
  }

  toggleChatbot = () => {
    this.setState(prevState => ({
      isOpen: !prevState.isOpen
    }));
  };

  handleOptionClick = (optionId, optionText) => {
    // Add user's choice as a message
    const userMessage = {
      text: optionText,
      sender: 'user',
      timestamp: new Date()
    };

    this.setState(prevState => ({
      messages: [...prevState.messages, userMessage],
      isTyping: true
    }), () => {
      // Scroll to bottom after user message
      this.scrollToBottom();
    });

    // Generate bot response based on option type
    setTimeout(() => {
      this.processOption(optionId);
    }, 800);
  };

  processOption = (optionId) => {
    let botMessage;
    let newCurrentOptions = this.state.currentOptions;

    if (optionId === 'back-main') {
      // Go back to main menu
      botMessage = {
        text: "What else would you like to know?",
        sender: 'bot',
        timestamp: new Date(),
        showOptions: true
      };
      newCurrentOptions = 'main';
    } else if (this.optionSets[optionId]) {
      // Navigate to submenu
      const submenu = this.optionSets[optionId];
      botMessage = {
        text: `Here are your options for ${submenu.title}:`,
        sender: 'bot',
        timestamp: new Date(),
        showOptions: true
      };
      newCurrentOptions = optionId;
    } else if (this.answers[optionId]) {
      // Show answer and return to current menu
      botMessage = {
        text: this.answers[optionId],
        sender: 'bot',
        timestamp: new Date(),
        showOptions: true
      };
    } else {
      // Fallback
      botMessage = {
        text: "I'm not sure about that. Let me show you the main options:",
        sender: 'bot',
        timestamp: new Date(),
        showOptions: true
      };
      newCurrentOptions = 'main';
    }

    this.setState(prevState => ({
      messages: [...prevState.messages, botMessage],
      isTyping: false,
      currentOptions: newCurrentOptions
    }), () => {
      // Scroll to bottom after bot response
      this.scrollToBottom();
    });
  };

  scrollToBottom = () => {
    if (this.messagesEndRef) {
      this.messagesEndRef.scrollIntoView({ behavior: 'smooth' });
    }
  };

  resetToMainMenu = () => {
    const botMessage = {
      text: "Hi! I'm here to help you with common questions about Rentacube. Please choose a topic below:",
      sender: 'bot',
      timestamp: new Date(),
      showOptions: true
    };

    this.setState({
      messages: [botMessage],
      currentOptions: 'main',
      isTyping: false
    }, () => {
      // Scroll to bottom after reset
      this.scrollToBottom();
    });
  };

  render() {
    const { isOpen, messages, isTyping, currentOptions } = this.state;

    return (
      <div className="chatbot-container">
        {/* Chat bubble trigger */}
        <div 
          className={`chatbot-bubble ${isOpen ? 'open' : ''}`}
          onClick={this.toggleChatbot}
        >
          <i className={`fas ${isOpen ? 'fa-times' : 'fa-comments'}`}></i>
        </div>

        {/* Chat window */}
        {isOpen && (
          <div className="chatbot-window">
            <div className="chatbot-header">
              <h6 className="mb-0">Rentacube Assistant</h6>
              <div>
                <button 
                  className="btn btn-sm btn-outline-light me-2"
                  onClick={this.resetToMainMenu}
                  title="Reset to main menu"
                >
                  <i className="fas fa-home"></i>
                </button>
                <button 
                  className="btn btn-sm btn-outline-light"
                  onClick={this.toggleChatbot}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>

            <div className="chatbot-messages">
              {messages.map((message, index) => (
                <div key={index}>
                  <div className={`message ${message.sender}`}>
                    <div className="message-content">
                      {message.text}
                    </div>
                    <div className="message-time">
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                  
                  {/* Show options after bot messages if specified */}
                  {message.sender === 'bot' && message.showOptions && (
                    <div className="chatbot-options">
                      {this.optionSets[currentOptions]?.options.map((option, optionIndex) => (
                        <button
                          key={optionIndex}
                          className="chatbot-option-btn"
                          onClick={() => this.handleOptionClick(option.id, option.text)}
                        >
                          {option.text}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="message bot">
                  <div className="message-content typing">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Invisible element to scroll to */}
              <div ref={el => this.messagesEndRef = el} />
            </div>
          </div>
        )}
      </div>
    );
  }
}
