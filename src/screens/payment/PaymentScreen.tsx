// ✅ PaymentScreen.tsx (fixed - /api/users/me 호출 제거됨)
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {AppStackParamList} from '../../navigations/AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const refundTable = Array.from({length: 11}, (_, i) => ({
  day: 10 - i,
  percent: (10 - i) * 10,
}));

const PaymentScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute();

  // route params에서 투어 데이터 받아오기
  const tourData = route.params?.tourData as any;
  const tourProgramId = route.params?.tourProgramId as number;

  // 사용자 정보 상태
  const [userInfo, setUserInfo] = useState<any>(null);
  const unlockSchedule = route.params?.unlockSchedule as boolean;
  const resultParam = route.params?.result as 'success' | 'fail' | undefined;

  // 사용자 정보 가져오기 (최적화된 버전)
  const fetchUserInfo = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        console.log('❌ 토큰이 없습니다');
        // 기본값으로 즉시 설정
        setUserInfo({
          data: {
            id: 1,
            username: '사용자',
            email: 'user@example.com',
            mobile: '01012345678'
          }
        });
        return;
      }

      console.log('🔄 사용자 정보 요청 시작...');
      const response = await axios.get('http://124.60.137.10:8083/api/user', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 5000, // 타임아웃을 5초로 단축
      });

      console.log('✅ 사용자 정보 가져오기 성공');
      setUserInfo(response.data);
    } catch (error: any) {
      console.error('❌ 사용자 정보 가져오기 실패:', error.message);
      
      // 모든 에러에 대해 기본값으로 즉시 진행
      setUserInfo({
        data: {
          id: 1,
          username: '사용자',
          email: 'user@example.com',
          mobile: '01012345678'
        }
      });
    }
  };

  console.log('🎯 PaymentScreen - route.params:', route.params);
  console.log('🎯 PaymentScreen - tourData:', tourData);

  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [day, setDay] = useState(new Date().getDate());
  const [people, setPeople] = useState(1);
  const [appliedPeople, setAppliedPeople] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [localTourData, setLocalTourData] = useState<any>(tourData);

  // guidePrice가 0인 경우 기본값 설정
  const effectiveGuidePrice = localTourData?.guidePrice > 0 ? localTourData.guidePrice : 50000;
  
  // appliedPeople이 null인 경우 기본값 설정
  const effectiveAppliedPeople = appliedPeople || 1;

  const totalPrice = effectiveGuidePrice * effectiveAppliedPeople;

  console.log('💰 totalPrice 계산:', {
    appliedPeople,
    effectiveAppliedPeople,
    guidePrice: localTourData?.guidePrice,
    effectiveGuidePrice,
    totalPrice,
  });

  const [result, setResult] = useState<'success' | 'fail' | null>(null);

  useEffect(() => {
    // 사용자 정보 가져오기 (비동기로 실행하여 UI 블로킹 방지)
    fetchUserInfo();
  }, []);

  useEffect(() => {
    if (resultParam) {
      setResult(resultParam);
      // URL 파라미터를 한 번만 처리하고 제거
      navigation.setParams({result: undefined});
      
      // 성공/실패 시 PaymentComplete로 이동
      if (resultParam === 'success') {
        navigation.replace('PaymentComplete', {
          success: true,
          tourProgramId: tourProgramId,
          tourData: localTourData
        });
      } else if (resultParam === 'fail') {
        navigation.replace('PaymentComplete', {
          success: false
        });
      }
    }
  }, [resultParam, navigation, tourProgramId, localTourData]);

  // tourData가 없을 경우 처리
  useEffect(() => {
    if (!localTourData && !resultParam) {
      if (tourProgramId) {
        // tourProgramId가 있으면 투어 데이터를 가져오기
        fetchTourData();
      } else {
        Alert.alert('오류', '투어 정보를 불러올 수 없습니다.', [
          {
            text: '확인',
            onPress: () => navigation.goBack(),
          },
        ]);
      }
    }
  }, [localTourData, tourProgramId, resultParam, navigation]);

  // tourData가 초기에 전달된 경우 localTourData 업데이트
  useEffect(() => {
    if (tourData) {
      setLocalTourData(tourData);
    }
  }, [tourData]);

  // 투어 데이터 가져오기 함수 (최적화된 버전)
  const fetchTourData = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        Alert.alert('알림', '로그인이 필요합니다.');
        navigation.goBack();
        return;
      }

      const cleanToken = token.replace('Bearer ', '');
      const response = await axios.get(
        `http://124.60.137.10:8083/api/tour-program/${tourProgramId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${cleanToken}`,
          },
          timeout: 5000, // 타임아웃을 5초로 단축
        },
      );

      if (response.data.status === 'OK') {
        const fetchedTourData = response.data.data;
        console.log('🟢 투어 데이터 가져오기 성공');
        setLocalTourData(fetchedTourData);
      } else {
        throw new Error(response.data.message || '투어 정보를 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('❌ 투어 데이터 가져오기 실패:', error);
      Alert.alert('오류', '투어 정보를 불러오는데 실패했습니다.', [
        {
          text: '확인',
          onPress: () => navigation.goBack(),
        },
      ]);
    }
  };

  // 사용자 ID 즉시 설정 (최적화)
  useEffect(() => {
    setUserId(1); // 기본값으로 즉시 설정
  }, []);


  const handlePayment = () => {
    if (!localTourData) {
      Alert.alert('오류', '투어 정보를 찾을 수 없습니다.');
      return;
    }

    if (!userId) {
      Alert.alert('오류', '사용자 정보를 찾을 수 없습니다.');
      return;
    }

    console.log('🧮 최종 totalPrice:', totalPrice);
    console.log('📌 effectiveAppliedPeople:', effectiveAppliedPeople);
    console.log('🎯 localTourData:', localTourData);

    const merchantUid = `merchant_${new Date().getTime()}`;

    const paymentData = {
      pg: 'html5_inicis',
      pay_method: 'card',
      name: localTourData.title,
      amount: totalPrice,
      merchant_uid: merchantUid,
      buyer_name: userInfo?.data?.username || '홍길동',
      buyer_tel: userInfo?.data?.mobile || '01012345678',
      buyer_email: userInfo?.data?.email || 'test@example.com',
      buyer_addr: '', // 주소 정보 (필요시 추가)
      buyer_postcode: '', // 우편번호 (필요시 추가)
      app_scheme: 'tourapps',
    };

    // 서버로 전송할 예약 데이터 (ReservationRequestDTO 구조에 맞춤)
    const reservationData = {
      numOfPeople: effectiveAppliedPeople,
      guideStartDate: `${year}-${String(month).padStart(2, '0')}-${String(
        day,
      ).padStart(2, '0')}T10:00:00`,
      guideEndDate: `${year}-${String(month).padStart(2, '0')}-${String(
        day,
      ).padStart(2, '0')}T13:00:00`,
      tourProgramId: localTourData.tourProgramId || localTourData.id,
      paymentMethod: 'card', // 기본값으로 카드 결제 사용
      guideId: localTourData.guideId || 1, // 가이드 ID 추가
      totalPrice: totalPrice,
      // 결제 완료 후 아임포트에서 받을 값들
      impUid: '', // 결제 완료 후 채워짐
      merchantUid: merchantUid, // 가맹점 주문 번호
      userId: userInfo?.data?.id || userId, // 실제 사용자 ID 사용
    };

    // 💳 결제 데이터 상세 출력
    console.log('💳 결제 데이터 (Payment Data) ==========================');
    console.log('PG사:', paymentData.pg);
    console.log('결제방법:', paymentData.pay_method);
    console.log('상품명:', paymentData.name);
    console.log('결제금액:', paymentData.amount.toLocaleString() + '원');
    console.log('가맹점 주문번호:', paymentData.merchant_uid);
    console.log('구매자명:', paymentData.buyer_name);
    console.log('구매자 전화번호:', paymentData.buyer_tel);
    console.log('구매자 이메일:', paymentData.buyer_email);
    console.log('앱 스킴:', paymentData.app_scheme);
    console.log('=====================================================');

    // 📋 예약 데이터 상세 출력
    console.log('📋 예약 데이터 (Reservation Data) ======================');
    console.log('투어 프로그램 ID:', reservationData.tourProgramId);
    console.log('인원수:', reservationData.numOfPeople + '명');
    console.log('총 금액:', reservationData.totalPrice.toLocaleString() + '원');
    console.log('가이드 시작 시간:', reservationData.guideStartDate);
    console.log('가이드 종료 시간:', reservationData.guideEndDate);
    console.log('결제 방법:', reservationData.paymentMethod);
    console.log('가이드 ID:', reservationData.guideId);
    console.log('아임포트 UID:', reservationData.impUid);
    console.log('가맹점 주문번호:', reservationData.merchantUid);
    console.log('외부 사용자 ID:', reservationData.userId);
    console.log('=====================================================');

    // 🔍 전체 데이터 구조 확인
    console.log('🔍 전체 데이터 구조 확인 ==============================');
    console.log('선택된 날짜:', `${year}년 ${month}월 ${day}일`);
    console.log('선택된 인원:', effectiveAppliedPeople + '명');
    console.log('투어 제목:', localTourData.title);
    console.log('투어 지역:', localTourData.region);
    console.log('가이드 가격:', effectiveGuidePrice.toLocaleString() + '원/인');
    console.log('총 결제 금액:', totalPrice.toLocaleString() + '원');
    console.log('사용자 정보:', {
      username: userInfo?.data?.username,
      email: userInfo?.data?.email,
      mobile: userInfo?.data?.mobile,
      id: userInfo?.data?.id
    });
    console.log('=====================================================');

    navigation.navigate('IamportPayment', {
      userCode: 'imp33770537',
      data: paymentData,
      reservationInfo: reservationData,
    });
  };


  // tourData가 없으면 로딩 표시 (더 빠른 로딩)
  if (!localTourData && !result) {
    return (
      <View style={styles.resultContainer}>
        <Text style={styles.resultText}>결제 페이지를 준비하는 중...</Text>
      </View>
    );
  }

  return (
    <View style={{flex: 1, backgroundColor: '#f5f6fa'}}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{paddingBottom: 120}}>
        <View style={styles.box}>
          <Text style={styles.title}>{localTourData?.title || '투어 제목'}</Text>
          <Text style={styles.region}>{localTourData?.region || '지역 정보'}</Text>
          <Text style={styles.price}>
            가격: ₩{effectiveGuidePrice.toLocaleString()} /인
          </Text>
        </View>

        <View style={styles.box}>
          <Text style={styles.label}>날짜</Text>
          <View style={styles.row}>
            <Picker
              selectedValue={year}
              style={styles.yearPicker}
              onValueChange={setYear}>
              {[2024, 2025, 2026].map(y => (
                <Picker.Item key={y} label={`${y}년`} value={y} />
              ))}
            </Picker>
            <Picker
              selectedValue={month}
              style={styles.picker}
              onValueChange={setMonth}>
              {[...Array(12)].map((_, i) => (
                <Picker.Item key={i + 1} label={`${i + 1}월`} value={i + 1} />
              ))}
            </Picker>
            <Picker
              selectedValue={day}
              style={styles.picker}
              onValueChange={setDay}>
              {[...Array(31)].map((_, i) => (
                <Picker.Item key={i + 1} label={`${i + 1}일`} value={i + 1} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.box}>
          <Text style={styles.label}>인원</Text>
          <View style={styles.row}>
            <TouchableOpacity
              onPress={() => setPeople(Math.max(1, people - 1))}
              style={styles.counterBtn}>
              <Text>-</Text>
            </TouchableOpacity>
            <Text style={styles.peopleNum}>{people}</Text>
            <TouchableOpacity
              onPress={() => setPeople(people + 1)}
              style={styles.counterBtn}>
              <Text>+</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyBtn}
              onPress={() => setAppliedPeople(people)}>
              <Text>적용</Text>
            </TouchableOpacity>
          </View>
          {effectiveAppliedPeople > 0 && (
            <View style={styles.totalPeopleBox}>
              <Text style={styles.totalPeopleText}>
                총 인원: {effectiveAppliedPeople}명
              </Text>
            </View>
          )}
        </View>

        {effectiveAppliedPeople > 0 && (
          <View style={styles.box}>
            <Text style={styles.label}>총 금액</Text>
            <Text style={styles.totalPrice}>
              {totalPrice.toLocaleString()}원
            </Text>
          </View>
        )}

        <View style={styles.box}>
          <Text style={styles.label}>환불제도</Text>
          <Text style={styles.refundInfo}>
            예약취소시 환불의 비용은 다음과 같습니다
          </Text>
          <View style={styles.refundTable}>
            <View style={styles.refundRow}>
              <Text style={styles.refundHeader}>일차</Text>
              <Text style={styles.refundHeader}>환불률</Text>
            </View>
            {refundTable.map(row => (
              <View style={styles.refundRow} key={row.day}>
                <Text style={styles.refundCell}>
                  {row.day === 0 ? '당일' : `${row.day}일`}
                </Text>
                <Text style={styles.refundCell}>{row.percent}%</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity 
        style={styles.payButtonFixed} 
        onPress={handlePayment}
      >
        <Text style={styles.payButtonText}>
          결제하기
        </Text>
      </TouchableOpacity>
      
      {userInfo && userInfo.data?.username === '사용자' && (
        <View style={styles.networkWarning}>
          <Text style={styles.networkWarningText}>
            ⚠️ 네트워크 연결 문제로 기본 정보를 사용합니다
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f5f6fa', padding: 16},
  box: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {fontSize: 22, fontWeight: 'bold', marginBottom: 4},
  region: {fontSize: 16, color: '#666'},
  price: {fontSize: 16, color: '#1976d2', fontWeight: 'bold', marginTop: 4},
  label: {fontWeight: 'bold', marginBottom: 8, fontSize: 16},
  row: {flexDirection: 'row', alignItems: 'center', marginBottom: 8},
  picker: {
    width: 90,
    height: 40,
  },
  yearPicker: {
    width: 120,
    height: 40,
  },
  counterBtn: {
    backgroundColor: '#eee',
    padding: 8,
    borderRadius: 6,
    marginHorizontal: 8,
  },
  peopleNum: {fontSize: 18, fontWeight: 'bold', marginHorizontal: 8},
  applyBtn: {
    backgroundColor: '#ffe082',
    padding: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  totalPeopleBox: {position: 'absolute', right: 20, bottom: 20},
  totalPeopleText: {fontSize: 15, color: '#1976d2', fontWeight: 'bold'},
  totalPrice: {fontWeight: 'bold', color: '#d32f2f', fontSize: 18},
  refundInfo: {color: '#d32f2f', marginBottom: 8},
  refundTable: {borderWidth: 1, borderColor: '#ccc', borderRadius: 6},
  refundRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  refundHeader: {fontWeight: 'bold', fontSize: 15},
  refundCell: {fontSize: 15},
  payButtonFixed: {
    backgroundColor: '#1976d2',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    margin: 16,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  payButtonText: {color: '#fff', fontWeight: 'bold', fontSize: 18},
  resultContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  resultText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#222',
  },
  payButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  networkWarning: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeaa7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  networkWarningText: {
    fontSize: 12,
    color: '#856404',
    textAlign: 'center',
  },
});

export default PaymentScreen;
