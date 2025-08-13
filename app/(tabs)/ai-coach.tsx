import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import BrutalHeader from '@/components/BrutalHeader';
import { trpc } from '@/lib/trpc';
import { API } from '@/lib/api';

import { Send } from 'lucide-react-native';

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
};

type ConversationMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const presetQuestions = [
  "How can I save more money?",
  "What's the best way to budget?",
  "How do I reduce my monthly expenses?",
  "Should I invest or save right now?",
  "How can I pay off my debt faster?",
  "Analyze my current financial situation",
  "What are my biggest spending areas?",
  "How can I increase my income?",
  "Should I consolidate my subscriptions?",
  "What's my net worth trend?",
];

export default function AICoachScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AI financial coach. How can I help you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const scrollViewRef = React.useRef<ScrollView>(null);
  
  const chatMutation = trpc.aiCoach.chat.useMutation({
    onError: (e: any) => {
      const msg = e?.message ?? 'The coach hit capacity—try again in a moment.';
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: msg,
        isUser: false,
        timestamp: new Date(),
      }]);
      setIsLoading(false);
    }
  });

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');
    setIsLoading(true);
    
    try {
      const res = await chatMutation.mutateAsync({ 
        message: currentInput, 
        conversationHistory: messages.map(m => ({
          role: m.isUser ? 'user' as const : 'assistant' as const,
          content: m.text
        }))
      });
      
      if (res?.success && res.message && res.message.trim()) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: res.message,
          isUser: false,
          timestamp: new Date(),
        }]);
      } else {
        // Fallback if we get an empty response
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: "I'm having trouble processing that right now. Please try rephrasing your question or ask again in a moment.",
          isUser: false,
          timestamp: new Date(),
        }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      // Error handling is now done in the mutation's onError
    } finally {
      setIsLoading(false);
    }
  };

  const handlePresetQuestion = (question: string) => {
    setInputText(question);
  };

  return (
    <SafeAreaView style={styles.container}>
      <BrutalHeader 
        title="AI Coach" 
        subtitle="Your personal financial advisor"
      />
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView 
          style={styles.messagesContainer}
          ref={scrollViewRef}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map(message => (
            <View 
              key={message.id} 
              style={[
                styles.messageBubble,
                message.isUser ? styles.userBubble : styles.aiBubble,
              ]}
            >
              <Text style={styles.messageText}>{message.text}</Text>
            </View>
          ))}
          
          {isLoading && (
            <View style={[styles.messageBubble, styles.aiBubble]}>
              <Text style={styles.messageText}>Typing...</Text>
            </View>
          )}
        </ScrollView>
        
        <View style={styles.presetContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {presetQuestions.map((question, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.presetButton}
                onPress={() => handlePresetQuestion(question)}
              >
                <Text style={styles.presetText}>{question}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask me anything about your finances..."
            placeholderTextColor={COLORS.darkGray}
            multiline
          />
          <TouchableOpacity 
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled
            ]} 
            onPress={handleSendMessage}
            disabled={!inputText.trim() || isLoading || chatMutation.isPending}
          >
            <Send size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  keyboardAvoid: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: COLORS.black,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.maroon,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  messageText: {
    fontSize: 16,
    color: COLORS.black,
  },
  presetContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  presetButton: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 2,
    borderColor: COLORS.black,
  },
  presetText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.black,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 2,
    borderTopColor: COLORS.black,
    backgroundColor: COLORS.white,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
    borderWidth: 2,
    borderColor: COLORS.black,
    padding: 12,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.maroon,
    marginLeft: 8,
    borderWidth: 2,
    borderColor: COLORS.black,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.darkGray,
    opacity: 0.7,
  },
});