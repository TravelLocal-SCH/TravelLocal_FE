import React, {useState, useEffect} from 'react';
import {API_URL} from '@env';
import {
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  View,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../navigations/root/RootNavigator';
import {useTranslation} from 'react-i18next';

type Question = {
  question: string;
  options: string[];
  result: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'QuestionScreen'>;
export default function QuestionScreen({navigation}: Props) {
  const {t, i18n} = useTranslation();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const accessToken = await AsyncStorage.getItem('accessToken');
        if (!accessToken) {
          Alert.alert(t('notification'), t('loginRequired'));
          return;
        }

        const res = await axios.get(
          `http://10.147.17.48:8000/generate_question`,
          {
            params: {language: i18n.language},
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        setQuestions(res.data.questions);
      } catch (error) {
        console.error(error);        if (axios.isAxiosError(error) && error.response?.status === 401) {
          Alert.alert(t('notification'), t('loginRequired'));
        } else {
          Alert.alert(t('error'), t('questionLoadError'));
        }
      }
    };
    fetchQuestions();
    console.log('📦 현재 언어:', i18n.language);
  }, [t, i18n.language]);

  const handleSelectAnswer = async (option: string) => {
    setSelected(option);
    const updatedAnswers = [...answers];
    updatedAnswers[currentIndex] = option;
    setAnswers(updatedAnswers);

    setTimeout(async () => {
      setSelected('');
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setLoading(true);
        try {
          const accessToken = await AsyncStorage.getItem('accessToken');
          if (!accessToken) {
            Alert.alert(t('notification'), t('loginRequired'));
            return;
          }
          console.log('📦 현재 언어1:', i18n.language);
          const res = await axios.post(
            `${API_URL}/rag_recommend?language=${i18n.language}`,
            {
              answers: updatedAnswers,
            },
            {
              withCredentials: true,
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Bearer ${accessToken}`,
              },
            },
          );
          navigation.navigate('Result', {result: res.data});
        } catch (error) {
          console.error(error);
          if (axios.isAxiosError(error) && error.response?.status === 401) {
            Alert.alert(t('notification'), t('loginRequired'));
          } else {
            Alert.alert(t('error'), t('analysisError'));
          }
        } finally {
          setLoading(false);
        }
      }
    }, 300);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelected(answers[currentIndex - 1] || '');
    }
  };

  if (loading) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <ActivityIndicator size="large" color="#0288d1" />
        <Text style={styles.loadingText}>{t('analyzing')}</Text>
      </ScrollView>
    );
  }

  if (questions.length === 0) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <ActivityIndicator size="large" color="#0288d1" />
        <Text style={styles.loadingText}>{t('loadingQuestions')}</Text>
      </ScrollView>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.pageTitle}>{t('travelPersonalityQuestion')}</Text>

      <View style={styles.card}>
        <Text style={styles.subtitle}>
          {t('questionProgress', {
            current: currentIndex + 1,
            total: questions.length,
          })}
        </Text>
        <Text style={styles.question}>{currentQuestion.question}</Text>

        <View style={styles.buttonGroup}>
          {currentQuestion.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleSelectAnswer(option)}
              style={[
                styles.optionButton,
                selected === option && styles.optionSelected,
              ]}
              activeOpacity={0.8}>
              <Text
                style={[
                  styles.optionText,
                  selected === option && styles.optionTextSelected,
                ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {currentIndex > 0 && (
          <TouchableOpacity style={styles.prevButton} onPress={handlePrevious}>
            <Text style={styles.prevButtonText}>{t('previousQuestion')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f0f9ff',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 10,
    textAlign: 'center',
  },
  question: {
    fontSize: 18,
    marginBottom: 24,
    textAlign: 'center',
    color: '#333',
    lineHeight: 26,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
  buttonGroup: {
    width: '100%',
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: '#BBDEFB',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  optionSelected: {
    backgroundColor: '#2196F3',
  },
  optionText: {
    fontSize: 16,
    color: '#0d47a1',
    textAlign: 'center',
  },
  optionTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  prevButton: {
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  prevButtonText: {
    color: '#1976D2',
    fontSize: 14,
  },
});
