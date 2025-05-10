  import React, {useState} from 'react';
  import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    Modal,
    SafeAreaView,
    ScrollView,
    TextInput,
    Alert,
  } from 'react-native';
  import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
  import {useNavigation} from '@react-navigation/native';
  import type {StackNavigationProp} from '@react-navigation/stack';

  // RootStackParamList 정의
  type RootStackParamList = {
    MyPage: undefined;
    Question: undefined;
    Result: undefined;
  };

  const MainScreen = () => {
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState('계정 정보');
    const [passwordConfirmed, setPasswordConfirmed] = useState(false);
    const [inputPassword, setInputPassword] = useState('');
    const [nickname, setNickname] = useState('홍길동');
    const [name, setName] = useState('홍길동');
    const [password, setPassword] = useState('1234');
    const [editingField, setEditingField] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');

    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

    const pickImage = () => {
      launchImageLibrary({mediaType: 'photo'}, response => {
        if (response.assets && response.assets.length > 0) {
          setProfileImage(response.assets[0].uri || null);
          setShowModal(false);
        }
      });
    };

    const takePhoto = () => {
      launchCamera({mediaType: 'photo'}, response => {
        if (response.assets && response.assets.length > 0) {
          setProfileImage(response.assets[0].uri || null);
          setShowModal(false);
        }
      });
    };

    const resetProfile = () => {
      setProfileImage(null);
      setShowModal(false);
    };

    const handlePasswordCheck = () => {
      if (inputPassword === password) {
        setPasswordConfirmed(true);
      } else {
        Alert.alert('오류', '비밀번호가 일치하지 않습니다');
      }
    };

    const saveEdit = () => {
      if (editingField === 'nickname') {
        setNickname(editValue);
      } else if (editingField === 'name') {
        setName(editValue);
      } else if (editingField === 'password') {
        setPassword(editValue);
      }
      setEditingField(null);
    };

    const handleLogout = () => {
      Alert.alert('로그아웃', '로그아웃 되었습니다');
      // 실제로는 토큰 삭제 및 로그인 화면 이동 필요
    };

    const renderContent = () => {
      if (selectedMenu === '계정 정보') {
        if (!passwordConfirmed) {
          return (
            <View>
              <Text>비밀번호를 입력하세요</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                value={inputPassword}
                onChangeText={setInputPassword}
                placeholder="비밀번호"
              />
              <TouchableOpacity
                onPress={handlePasswordCheck}
                style={styles.confirmButton}>
                <Text>확인</Text>
              </TouchableOpacity>
            </View>
          );
        }

        if (editingField) {
          return (
            <View>
              <Text>{editingField} 변경</Text>
              <TextInput
                style={styles.input}
                value={editValue}
                onChangeText={setEditValue}
                placeholder={`${editingField} 입력`}
                secureTextEntry={editingField === 'password'}
              />
              <TouchableOpacity onPress={saveEdit} style={styles.confirmButton}>
                <Text>저장</Text>
              </TouchableOpacity>
            </View>
          );
        }

        return (
          <View>
            <Text style={styles.sectionTitle}>변경하기</Text>
            <TouchableOpacity
              onPress={() => {
                setEditingField('nickname');
                setEditValue(nickname);
              }}>
              <Text style={styles.linkItem}>닉네임 변경 </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setEditingField('name');
                setEditValue(name);
              }}>
              <Text style={styles.linkItem}>아이디 변경 </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setEditingField('password');
                setEditValue('');
              }}>
              <Text style={styles.linkItem}>비밀번호 변경 </Text>
            </TouchableOpacity>

            <View style={styles.sectionDivider} />

            <Text style={styles.sectionTitle}>로그아웃</Text>
            <TouchableOpacity onPress={handleLogout}>
              <Text style={styles.linkItem}>로그아웃 </Text>
            </TouchableOpacity>

            <View style={styles.sectionDivider} />

            <Text style={styles.sectionTitle}>회원탈퇴</Text>
            <TouchableOpacity
              onPress={() =>
                Alert.alert('탈퇴', '회원탈퇴 기능은 준비 중입니다.')
              }>
              <Text style={styles.linkItem}>회원탈퇴 </Text>
            </TouchableOpacity>
          </View>
        );
      }

      switch (selectedMenu) {
        case '이용 내역':
          return <Text>여기에 이용 내역 표시</Text>;
        case '성향 리스트':
          return <Text>여기에 성향 리스트 표시</Text>;
        case '게시 내역':
          return <Text>여기에 게시 내역 표시</Text>;
        case '접근성':
          return <Text>여기에 접근성 옵션 표시</Text>;
        case '관광 프로그램 Helper':
          return <Text>여기에 관광 프로그램 정보 표시</Text>;
        case '예약 요청 목록 리스트':
          return <Text>여기에 예약 요청 리스트 표시</Text>;
        case '1:1 문의':
          return <Text>여기에 1:1 문의 내용 표시</Text>;
        default:
          return <Text>선택된 항목이 없습니다.</Text>;
      }
    };

    const goToTest = () => {
      navigation.navigate('Question');
    };

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.profileContainer}>
          <TouchableOpacity onPress={() => setShowModal(true)}>
            <Image
              source={
                profileImage
                  ? {uri: profileImage}
                  : require('../../assets/default.png')
              }
              style={styles.profileCircle}
            />
          </TouchableOpacity>
          <Text style={styles.profileName}>{nickname}</Text>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity style={styles.tabButton} onPress={goToTest}>
            <Text>성향테스트 하러 가기</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabButton}>
            <Text>프로그램 작성하러 가기</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          <View style={styles.sidebar}>
            {[
              '계정 정보',
              '이용 내역',
              '성향 리스트',
              '게시 내역',
              '접근성',
              '관광 프로그램 Helper',
              '예약 요청 목록 리스트',
              '1:1 문의',
            ].map(item => (
              <TouchableOpacity
                key={item}
                onPress={() => setSelectedMenu(item)}
                style={styles.sidebarItem}>
                <Text style={styles.sidebarText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.mainContent}>
            <ScrollView>{renderContent()}</ScrollView>
          </View>
        </View>

        <Modal visible={showModal} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <TouchableOpacity onPress={takePhoto}>
              <Text style={styles.modalText}>📷 사진 찍기</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={pickImage}>
              <Text style={styles.modalText}>🖼 갤러리에서 선택</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={resetProfile}>
              <Text style={styles.modalText}>🔄 기본 이미지로 변경</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={styles.modalText}>❌ 취소</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </SafeAreaView>
    );
  };

  export default MainScreen;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    profileContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
    },
    profileCircle: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: '#ddd',
      justifyContent: 'center',
      alignItems: 'center',
    },
    profileName: {
      fontSize: 18,
      marginLeft: 10,
    },
    tabContainer: {
      flexDirection: 'row',
      marginHorizontal: 10,
    },
    tabButton: {
      flex: 1,
      padding: 10,
      borderWidth: 1,
      borderColor: '#aaa',
      alignItems: 'center',
    },
    body: {
      flex: 1,
      flexDirection: 'row',
    },
    sidebar: {
      width: 100,
      backgroundColor: '#e0e0e0',
      paddingVertical: 10,
    },
    sidebarItem: {
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#ccc',
    },
    sidebarText: {
      fontWeight: '500',
    },
    mainContent: {
      flex: 1,
      padding: 16,
    },
    modalContainer: {
      backgroundColor: '#ffffffee',
      position: 'absolute',
      bottom: 0,
      width: '100%',
      padding: 20,
    },
    modalText: {
      fontSize: 18,
      paddingVertical: 10,
    },
    input: {
      borderWidth: 1,
      borderColor: '#aaa',
      borderRadius: 5,
      padding: 8,
      marginVertical: 10,
    },
    confirmButton: {
      backgroundColor: '#ddd',
      padding: 10,
      alignItems: 'center',
      borderRadius: 5,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 10,
      marginTop: 20,
    },
    linkItem: {
      fontSize: 15,
      paddingVertical: 6,
      color: '#333',
    },
    sectionDivider: {
      borderBottomWidth: 1,
      borderBottomColor: '#ccc',
      marginVertical: 15,
    },
  });
