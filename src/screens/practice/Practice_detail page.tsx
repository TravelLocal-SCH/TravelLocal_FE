// ✅ Practice.tsx - 개선된 전체 코드 (보안, 안정성, 시각화 향상)

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import type {RouteProp} from '@react-navigation/native';
import type {AppStackParamList} from '../../navigations/AppNavigator';
import axios from 'axios';
import MapView, {Marker, Polyline, PROVIDER_GOOGLE} from 'react-native-maps';
import haversine from 'haversine-distance';

const dayColors = ['#0288d1', '#43a047', '#fbc02d', '#e64a19', '#8e24aa'];

type Schedule = {
  day: number;
  lat: number;
  lon: number;
  placeName: string;
  placeDescription: string;
  travelTime: number;
};

type TourData = {
  id: number;
  title: string;
  region: string;
  thumbnailUrl: string;
  reviewCount: number;
  wishlistCount: number;
  hashtags: string[];
  schedules: Schedule[];
  user: {id: number; name: string};
  description: string;
  guidePrice: number;
};

const Practice = () => {
  const [data, setData] = useState<TourData | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<StackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'Practice'>>();
  const tourProgramId = route.params?.tourProgramId ?? 1;

  useEffect(() => {
    // 더미 데이터로 대체
    setData({
      id: 1,
      title: '예시 투어 프로그램',
      region: '서울',
      thumbnailUrl: 'https://via.placeholder.com/400x200?text=No+Image',
      reviewCount: 5,
      wishlistCount: 10,
      hashtags: ['서울', '맛집', '관광'],
      schedules: [
        {
          day: 1,
          lat: 37.5665,
          lon: 126.978,
          placeName: '광화문',
          placeDescription: '서울의 중심',
          travelTime: 30,
        },
        {
          day: 1,
          lat: 37.5702,
          lon: 126.983,
          placeName: '경복궁',
          placeDescription: '조선의 궁궐',
          travelTime: 20,
        },
        {
          day: 2,
          lat: 37.5796,
          lon: 126.977,
          placeName: '북촌한옥마을',
          placeDescription: '전통 한옥',
          travelTime: 15,
        },
      ],
      user: {id: 2, name: '홍길동'},
      description: '서울의 명소를 둘러보는 투어입니다.',
      guidePrice: 30000,
    });
    setLoading(false);
  }, [tourProgramId]);

  const toggleLike = () => {
    setIsLiked(prev => !prev);
    if (data) {
      setData({
        ...data,
        wishlistCount: isLiked
          ? data.wishlistCount - 1
          : data.wishlistCount + 1,
      });
    }
  };

  const getTotalDistance = (schedules: Schedule[]) => {
    let total = 0;
    for (let i = 1; i < schedules.length; i++) {
      total += haversine(
        {latitude: schedules[i - 1].lat, longitude: schedules[i - 1].lon},
        {latitude: schedules[i].lat, longitude: schedules[i].lon},
      );
    }
    return (total / 1000).toFixed(1);
  };

  // 상담하기 버튼 클릭 시 채팅방 생성 및 입장
  const handleChat = async () => {
    try {
      const userId = 1; // 내 아이디(로그인 유저)
      const hostId = data?.user?.id || 2; // 상대방 아이디(호스트)
      const res = await axios.post('/api/chat/rooms', {
        user1Id: userId,
        user2Id: hostId,
      });
      const roomId = res.data.id;
      navigation.navigate('Main', {
        screen: '채팅',
        params: {
          screen: 'ChatRoomScreen',
          params: {roomId, userId},
        },
      });
    } catch (e) {
      console.error(e);
    }
  };

  // 투어 수정
  const handleEdit = async () => {
    if (!data) return;
    try {
      const body = {
        title: data.title,
        description: data.description,
        guidePrice: data.guidePrice,
        region: data.region,
        thumbnailUrl: data.thumbnailUrl,
        hashtags: data.hashtags,
        schedules: data.schedules.map((s, idx) => ({
          day: s.day,
          scheduleSequence: idx,
          placeName: s.placeName,
          lat: s.lat,
          lon: s.lon,
          placeDescription: s.placeDescription,
          travelTime: s.travelTime,
        })),
      };
      await axios.put(`/api/tour-program/${data.id}`, body);
      Alert.alert('수정 완료', '투어 정보가 수정되었습니다.');
    } catch (e) {
      Alert.alert('수정 실패', '투어 정보 수정에 실패했습니다.');
    }
  };

  // 투어 삭제
  const handleDelete = async () => {
    if (!data) return;
    try {
      await axios.delete(`/api/tour-program/${data.id}`);
      Alert.alert('삭제 완료', '투어가 삭제되었습니다.');
      // 필요시 목록 등으로 이동
    } catch (e) {
      Alert.alert('삭제 실패', '투어 삭제에 실패했습니다.');
    }
  };

  if (loading)
    return <ActivityIndicator style={{marginTop: 40}} size="large" />;
  if (!data)
    return (
      <Text style={{marginTop: 40, textAlign: 'center'}}>데이터 없음</Text>
    );

  const groupedSchedules = data.schedules.reduce((acc, cur) => {
    const key = `Day ${cur.day}`;
    acc[key] = acc[key] || [];
    acc[key].push(cur);
    return acc;
  }, {} as Record<string, Schedule[]>);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Image source={{uri: data.thumbnailUrl}} style={styles.map} />
        <View style={styles.whiteBox}>
          <Text style={styles.title}>{data.title}</Text>

          <View style={styles.editDeleteRow}>
            <TouchableOpacity onPress={handleEdit} style={styles.editBtn}>
              <Text style={styles.editText}>수정</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
              <Text style={styles.deleteText}>삭제</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.rightAlignRow}>
            <Text style={styles.region}>📍 {data.region}</Text>
            <View style={styles.rowRight}>
              <TouchableOpacity onPress={() => navigation.navigate('Practice')}>
                <Text style={styles.review}>💬 리뷰 {data.reviewCount}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={toggleLike}>
                <Text style={styles.like}>
                  {isLiked ? '💖 찜함' : '🤍 찜'} {data.wishlistCount}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.tags}>
            {data.hashtags.map((tag, i) => (
              <Text key={i} style={styles.tag}>
                #{tag}
              </Text>
            ))}
          </View>

          <Text style={styles.sectionTitle}>🗓️ 일정</Text>
          {Object.entries(groupedSchedules).map(([day, items], i) => (
            <View key={i} style={styles.scheduleCard}>
              <Text style={styles.dayTitle}>{day}</Text>
              {items.map((item, idx) => (
                <Text key={idx} style={styles.scheduleItem}>
                  ⏱ {item.placeName} ({item.travelTime}분) -{' '}
                  {item.placeDescription}
                </Text>
              ))}
            </View>
          ))}

          <Text style={styles.sectionTitle}>🗺 지도</Text>
          <View
            style={{
              height: 300,
              marginBottom: 20,
              borderRadius: 12,
              overflow: 'hidden',
            }}>
            <MapView
              style={{flex: 1}}
              provider={PROVIDER_GOOGLE}
              initialRegion={
                data.schedules.length > 0
                  ? {
                      latitude: data.schedules[0].lat,
                      longitude: data.schedules[0].lon,
                      latitudeDelta: 0.05,
                      longitudeDelta: 0.05,
                    }
                  : {
                      latitude: 37.5665,
                      longitude: 126.978,
                      latitudeDelta: 0.05,
                      longitudeDelta: 0.05,
                    }
              }>
              {data.schedules.map((s, idx) => (
                <Marker
                  key={idx}
                  coordinate={{latitude: s.lat, longitude: s.lon}}
                  title={`Day ${s.day} - ${s.placeName}`}
                  description={s.placeDescription}
                  pinColor={dayColors[(s.day - 1) % dayColors.length]}
                />
              ))}
              <Polyline
                coordinates={data.schedules.map(s => ({
                  latitude: s.lat,
                  longitude: s.lon,
                }))}
                strokeColor="#0288d1"
                strokeWidth={3}
              />
            </MapView>
            <Text style={{textAlign: 'right', marginTop: 6}}>
              총 거리: {getTotalDistance(data.schedules)}km
            </Text>
          </View>

          <Text style={styles.sectionTitle}>🧑‍💼 호스트 정보</Text>
          <Text style={styles.description}>호스트: {data.user.name}</Text>

          <Text style={styles.sectionTitle}>📖 투어 설명</Text>
          <Text style={styles.description}>{data.description}</Text>

          <View style={{height: 100}} />
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Text style={styles.price}>
          ₩{data.guidePrice.toLocaleString()} /인
        </Text>
        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.chatBtn} onPress={handleChat}>
            <Text style={styles.chatText}>상담하기</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.reserveBtn}
            onPress={() => navigation.navigate('PaymentScreen')}>
            <Text style={styles.reserveText}>예약하기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  thumbnail: {width: '100%', height: 230},
  whiteBox: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    padding: 20,
  },
  title: {fontSize: 22, fontWeight: 'bold'},
  region: {fontSize: 14, color: '#666', marginBottom: 6},
  review: {fontSize: 14},
  like: {fontSize: 14},
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  tag: {
    backgroundColor: '#eee',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 4,
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 20,
  },
  scheduleCard: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  dayTitle: {fontWeight: 'bold', marginBottom: 6},
  scheduleItem: {fontSize: 14, marginBottom: 4},
  map: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    marginTop: 10,
  },
  description: {fontSize: 14, color: '#333'},
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 14,
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  reserveBtn: {
    backgroundColor: '#FF385C',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  reserveText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  chatBtn: {
    backgroundColor: '#ddd',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  chatText: {
    color: '#333',
    fontWeight: 'bold',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rightAlignRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  editBtn: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  deleteBtn: {
    backgroundColor: '#f44336',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 6,
  },
  deleteText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  editDeleteRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    marginTop: 18,
    marginBottom: 12,
  },
});

export default Practice;
