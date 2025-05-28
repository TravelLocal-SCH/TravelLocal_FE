// ✅ TraitDropdown.tsx - 전체 API 연동 완료 버전

import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import axios from 'axios';

interface MbtiItem {
  mbtiId: number;
  mbti: string;
}

interface MbtiDetail {
  mbti: string;
  hashtags: string[];
  recommended_regions: string[];
}

const TraitDropdown = () => {
  const [mbtiList, setMbtiList] = useState<MbtiItem[]>([]);
  const [selectedMbti, setSelectedMbti] = useState<MbtiDetail | null>(null);
  const [selectedRegionName, setSelectedRegionName] = useState<string | null>(
    null,
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [selectedSort, setSelectedSort] = useState('최신순');
  const [displayedPosts, setDisplayedPosts] = useState(7);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    axios
      .get('http://localhost:8080/api/mbti/all-mbti', {
        headers: {Authorization: `Bearer ${process.env.API_TOKEN}`},
      })
      .then(res => setMbtiList(res.data.data))
      .catch(err => console.error('MBTI 리스트 로딩 실패:', err));
  }, []);

  const handleSelectMbti = async (item: MbtiItem) => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/mbti/detail-mbti?mbtiId=${item.mbtiId}&mbti=${item.mbti}`,
        {
          headers: {Authorization: `Bearer ${process.env.API_TOKEN}`},
        },
      );
      setSelectedMbti(res.data.data);
      setShowDropdown(false);
      setSelectedRegionName(null);
      setDisplayedPosts(7);
    } catch (err) {
      console.error('MBTI 상세정보 로딩 실패:', err);
    }
  };

  const dummyPosts = [
    {
      title: '강릉 바다 옆 한옥카페 추천',
      region: '강릉',
      likes: 87,
      comments: 12,
    },
    {
      title: '부산 광안리 일몰 명소 3곳!',
      region: '부산',
      likes: 102,
      comments: 25,
    },
    {
      title: '전주 한옥마을 전통 체험 후기',
      region: '전주',
      likes: 56,
      comments: 8,
    },
    {
      title: '제주도 숨은 협재 해변 뷰 맛집',
      region: '제주',
      likes: 93,
      comments: 16,
    },
    {
      title: '강릉 당일치기 코스 총정리',
      region: '강릉',
      likes: 70,
      comments: 10,
    },
    {
      title: '부산 감천문화마을 사진 포인트',
      region: '부산',
      likes: 110,
      comments: 31,
    },
    {
      title: '전주에서 전통 찻집 데이트 해봤어요',
      region: '전주',
      likes: 43,
      comments: 6,
    },
    {
      title: '제주 동백꽃 필 무렵, 인생샷 스팟',
      region: '제주',
      likes: 85,
      comments: 19,
    },
  ];

  const handleOutsidePress = () => {
    setShowDropdown(false);
    setShowSortDropdown(false);
  };

  const handleSortSelect = (option: string): void => {
    setSelectedSort(option);
    setShowSortDropdown(false);
  };

  const loadMorePosts = () => {
    if (!loadingMore && displayedPosts < sortedPosts.length) {
      setLoadingMore(true);
      setTimeout(() => {
        setDisplayedPosts(prev => prev + 7);
        setLoadingMore(false);
      }, 500);
    }
  };

  const filteredPosts = dummyPosts.filter(
    post => !selectedRegionName || post.region === selectedRegionName,
  );

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (selectedSort === '인기순') return b.likes - a.likes;
    if (selectedSort === '댓글순') return b.comments - a.comments;
    return 0;
  });

  return (
    <TouchableWithoutFeedback onPress={handleOutsidePress}>
      <FlatList
        data={selectedMbti ? sortedPosts.slice(0, displayedPosts) : []}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item}) => (
          <View style={styles.postCard}>
            <Text style={styles.postTitle}>{item.title}</Text>
            <Text style={styles.postMeta}>
              ❤️ {item.likes} 💬 {item.comments}
            </Text>
          </View>
        )}
        onEndReached={loadMorePosts}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? <Text>로딩 중…</Text> : <View style={{height: 30}} />
        }
        ListHeaderComponent={
          <View style={styles.container}>
            <View style={styles.centeredRow}>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowDropdown(!showDropdown)}>
                <Text style={styles.dropdownButtonText}>
                  {selectedMbti ? selectedMbti.mbti : '클릭하여 성향 선택'}
                </Text>
              </TouchableOpacity>
            </View>
            {showDropdown && (
              <View style={styles.dropdownList}>
                <FlatList
                  data={mbtiList}
                  keyExtractor={(item, index) => `${item.mbti}-${index}`}
                  renderItem={({item}) => (
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => handleSelectMbti(item)}>
                      <Text style={styles.dropdownItemText}>{item.mbti}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}
            {selectedMbti && (
              <>
                <Text style={styles.sectionTitle}>해시태그</Text>
                <View style={styles.hashtagBox}>
                  {selectedMbti.hashtags.map((tag, i) => (
                    <Text key={i} style={styles.hashtagText}>
                      #{tag}
                    </Text>
                  ))}
                </View>
                <Text style={styles.sectionTitle}>추천 지역</Text>
                <View style={styles.regionGrid}>
                  {selectedMbti.recommended_regions.map((region, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[
                        styles.regionItem,
                        selectedRegionName === region &&
                          styles.selectedRegionItem,
                      ]}
                      onPress={() => {
                        setSelectedRegionName(region);
                        setDisplayedPosts(7);
                      }}>
                      <Text style={styles.regionText}>{region}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
            {selectedMbti && (
              <View style={styles.postContainer}>
                <Text style={styles.postText}>게시글</Text>
                <TouchableOpacity
                  style={styles.sortButton}
                  onPress={() => setShowSortDropdown(!showSortDropdown)}>
                  <Text style={styles.sortButtonText}>{selectedSort}</Text>
                </TouchableOpacity>
                {showSortDropdown && (
                  <View style={styles.sortDropdown}>
                    {['최신순', '인기순', '댓글순'].map(option => (
                      <TouchableOpacity
                        key={option}
                        onPress={() => handleSortSelect(option)}>
                        <Text style={styles.sortDropdownItem}>{option}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>
        }
      />
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, padding: 20, backgroundColor: '#f7f7fa'},
  centeredRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dropdownButton: {
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  dropdownButtonText: {fontSize: 16, color: '#000'},
  dropdownList: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginTop: 5,
  },
  dropdownItem: {padding: 15, borderBottomWidth: 1, borderBottomColor: '#ddd'},
  dropdownItemText: {fontSize: 16, color: '#000'},
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  hashtagBox: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  hashtagText: {
    fontSize: 14,
    backgroundColor: '#e0e0e0',
    padding: 6,
    borderRadius: 5,
    marginRight: 8,
  },
  regionGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 10},
  regionItem: {padding: 10, backgroundColor: '#f0f0f0', borderRadius: 5},
  selectedRegionItem: {backgroundColor: '#d0e0f0'},
  regionText: {fontSize: 14, color: '#000'},
  postContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  postText: {fontSize: 18, fontWeight: 'bold'},
  sortButton: {
    padding: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  sortButtonText: {fontSize: 14},
  sortDropdown: {
    position: 'absolute',
    top: 40,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    zIndex: 100,
  },
  sortDropdownItem: {padding: 10, fontSize: 14},
  postCard: {
    marginTop: 10,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  postTitle: {fontSize: 16, fontWeight: 'bold', marginBottom: 5},
  postMeta: {fontSize: 14, color: '#888'},
});

export default TraitDropdown;
