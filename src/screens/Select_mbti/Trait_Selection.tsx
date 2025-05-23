// ✅ TraitDropdown.tsx - MBTI 기반 추천 지역 게시글 뷰

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

const TraitDropdown = () => {
  const [mbtiList, setMbtiList] = useState<MbtiItem[]>([]);
  const [selectedMbti, setSelectedMbti] = useState<MbtiItem | null>(null);
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
      .get('http://10.0.2.2:8003/get_mbti_by_token')
      .then(res => setMbtiList(res.data))
      .catch(err => console.error('MBTI 불러오기 오류:', err));
  }, []);

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
    {
      title: '강릉 맛집 지도 공유합니다!',
      region: '강릉',
      likes: 65,
      comments: 11,
    },
    {
      title: '부산 해운대 새로 생긴 루프탑 카페',
      region: '부산',
      likes: 95,
      comments: 22,
    },
    {
      title: '전주 한지공예 클래스 후기',
      region: '전주',
      likes: 52,
      comments: 7,
    },
    {
      title: '제주 푸른밤 캠핑장 리얼 후기',
      region: '제주',
      likes: 74,
      comments: 14,
    },
    {
      title: '강릉 오죽헌 근처 산책로 코스',
      region: '강릉',
      likes: 58,
      comments: 9,
    },
    {
      title: '부산 송도 해상 케이블카 후기',
      region: '부산',
      likes: 90,
      comments: 20,
    },
    {
      title: '전주 청년몰에서 먹방 투어',
      region: '전주',
      likes: 61,
      comments: 12,
    },
    {
      title: '제주 아침미소목장 가족 체험',
      region: '제주',
      likes: 80,
      comments: 13,
    },
  ];

  const handleOutsidePress = () => {
    setShowDropdown(false);
    setShowSortDropdown(false);
  };

  interface MbtiItem {
    mbti: string;
    tags: string[];
    recommended_regions: string[];
  }

  const handleSelectMbti = (item: MbtiItem): void => {
    setSelectedMbti(item);
    setShowDropdown(false);
    setSelectedRegionName(null);
    setDisplayedPosts(7);
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
    return 0; // 최신순은 그대로
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
          loadingMore ? (
            <View style={styles.loadingBox}>
              <Text style={styles.loadingText}>더보기 로딩 중…</Text>
            </View>
          ) : (
            <View style={{height: 30}} />
          )
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
                <View style={styles.hashtagBox}>
                  <Text style={styles.hashtagTitle}>해시태그</Text>
                  <View style={styles.hashtagGrid}>
                    {selectedMbti.tags.map((tag, index) => (
                      <View key={index} style={styles.hashtagItem}>
                        <Text style={styles.hashtagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.regionContainer}>
                  <Text style={styles.regionTitle}>추천 지역</Text>
                  <View style={styles.regionGrid}>
                    {selectedMbti.recommended_regions.map((region, index) => (
                      <TouchableOpacity
                        key={index}
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
                </View>

                <View style={styles.postContainer}>
                  <Text style={styles.postText}>게시글</Text>
                  <View style={{position: 'relative', zIndex: 999}}>
                    <TouchableOpacity
                      style={styles.sortButton}
                      onPress={() => setShowSortDropdown(!showSortDropdown)}>
                      <Text style={styles.sortButtonText}>{selectedSort}</Text>
                    </TouchableOpacity>
                    {showSortDropdown && (
                      <View style={styles.sortDropdown}>
                        {['최신순', '인기순', '댓글순'].map((option, index) => (
                          <TouchableOpacity
                            key={index}
                            style={styles.sortDropdownItem}
                            onPress={() => handleSortSelect(option)}>
                            <Text style={styles.dropdownItemText}>
                              {option}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                </View>

                {selectedRegionName && (
                  <View style={styles.selectedRegionBox}>
                    <Text style={styles.selectedRegionText}>
                      📍 선택된 지역: {selectedRegionName}
                    </Text>
                  </View>
                )}
              </>
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
  hashtagBox: {
    marginTop: 10,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  hashtagTitle: {fontSize: 18, fontWeight: 'bold', marginBottom: 10},
  hashtagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  hashtagItem: {
    width: '30%',
    marginBottom: 10,
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  hashtagText: {fontSize: 16, color: '#555'},
  regionContainer: {marginTop: 10},
  regionTitle: {fontSize: 18, fontWeight: 'bold', marginBottom: 10},
  regionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  regionItem: {
    width: '30%',
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  selectedRegionItem: {backgroundColor: '#d0e0f0'},
  regionText: {fontSize: 16, color: '#000'},
  postContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  postText: {fontSize: 18, fontWeight: 'bold', color: '#333'},
  sortButton: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    width: 100,
    alignItems: 'center',
  },
  sortButtonText: {fontSize: 16, color: '#000'},
  sortDropdown: {
    position: 'absolute',
    top: 45,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 100,
  },
  sortDropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
    width: 100,
  },
  selectedRegionBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#e0f7fa',
    borderRadius: 5,
    alignItems: 'center',
  },
  selectedRegionText: {fontSize: 16, color: '#00796b', fontWeight: '500'},
  postCard: {
    marginTop: 10,
    padding: 15,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
  },
  postTitle: {fontSize: 16, fontWeight: '600', marginBottom: 5, color: '#555'},
  postMeta: {fontSize: 14, color: '#888'},
  loadingBox: {paddingVertical: 20, alignItems: 'center'},
  loadingText: {fontSize: 14, color: '#777'},
});

export default TraitDropdown;
