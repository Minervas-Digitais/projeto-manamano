/* eslint-disable global-require */
/* eslint-disable react/jsx-closing-bracket-location */
/* eslint-disable react/jsx-indent */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-wrap-multilines */
import React, { useState, useEffect } from 'react';
import {
  Image,
  TouchableOpacity,
  View,
  Text,
  TextInput,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Buffer } from 'buffer';
import { MMKV } from 'react-native-mmkv';
import {
  PageContainer,
  SearchInputWrapper,
  SearchIcon,
  RecentSection,
  ContentContainer,
} from './SearchStyle';
import ResultSection from '../../components/ResultSection/ResultSection';
import Lupa from '../../assets/lupa-search.svg';
import api from '../../services/api';
import ScreenWithHeader from '../../components/ScreenWithHeader/ScreenWithHeader';
import { useAuth } from '../../context/auth/useAuth';

const storage = new MMKV();

interface User {
  id: string;
  name: string;
  avatar: any;
}

export default function Search() {
  const { accessToken, loggedId } = useAuth();
  const [searchText, setSearchText] = useState<string>('');
  const [debouncedSearchText, setDebouncedSearchText] = useState<string>('');
  const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const avatar = require('../../assets/user-profile.png');

  const getUserProfileImage = async (userId: string) => {
    if (!accessToken) {
      return avatar;
    }

    try {
      const imageResponse = await api.get(`/user/${userId}/profile-picture`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        responseType: 'arraybuffer',
      });

      const imageStr = Buffer.from(imageResponse.data, 'binary').toString('base64');
      const imageUri = `data:image/jpeg;base64,${imageStr}`;
      return { uri: imageUri };
    } catch (error) {
      return avatar;
    }
  };

  useEffect(() => {
    const storedUsers = storage.getString('recentUsers');
    if (storedUsers) {
      setRecentUsers(JSON.parse(storedUsers));
    }
  }, []);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!accessToken || !loggedId) return;

      try {
        const res = await api.get(`/user/${loggedId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (res.data?.sysRole === 'ADMIN') {
          setIsAdmin(true);
        }
      } catch {
        setIsAdmin(false);
      }
    };

    fetchUserRole();
  }, [accessToken, loggedId]);

  const saveRecentUser = async (user: { id: string; name: string }) => {
    const image = await getUserProfileImage(user.id);

    const newUser: User = {
      ...user,
      avatar: image,
    };

    const updatedUsers = [newUser, ...recentUsers.filter((item) => item.id !== user.id)];

    if (updatedUsers.length > 10) {
      updatedUsers.pop();
    }

    setRecentUsers(updatedUsers);
    storage.set('recentUsers', JSON.stringify(updatedUsers));
  };

  const handleAvatarPress = () => {};

  const screenWidth = Dimensions.get('window').width;

  useEffect(
    () => () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    },
    [timeoutId],
  );

  const handleSearchChange = (text: string) => {
    setSearchText(text);

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const id = setTimeout(() => {
      setDebouncedSearchText(text);
    }, 2000);
    setTimeoutId(id);
  };

  return (
    <ScreenWithHeader
      headerProps={{
        font: 'inter-bold',
        text: 'Pesquisa',
        testID: 'titulo-pesquisa',
      }}>
      <PageContainer>
        <ContentContainer>
          <SearchInputWrapper>
            <SearchIcon>
              <Lupa />
            </SearchIcon>
            <TextInput
              placeholder="Pesquisar"
              value={searchText}
              onChangeText={handleSearchChange}
              style={{
                flex: 1,
                fontSize: 16,
                color: '#ABAFB1',
                padding: 0,
                margin: 0,
                borderWidth: 0,
                fontFamily: 'inter-regular',
              }}
              testID="input-pesquisa"
            />
          </SearchInputWrapper>

          {debouncedSearchText.length > 0 && accessToken ? (
            <ResultSection
              searchText={debouncedSearchText}
              saveRecentUser={saveRecentUser}
              accessToken={accessToken}
              admin={isAdmin}
            />
          ) : (
            <RecentSection>
              {recentUsers.length > 0 && (
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: 'bold',
                    marginBottom: 10,
                    fontFamily: 'inter-bold',
                    color: '#515151',
                  }}>
                  Recentes
                </Text>
              )}
              <ScrollView
                testID="scroll-recentes"
                horizontal
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled>
                {recentUsers.map((user) => {
                  const nameParts = user.name.split(' ');
                  return (
                    <View
                      key={user.id}
                      style={{ alignItems: 'center', marginRight: 20 }}
                      testID={`usuario-${user.name.toLowerCase().replace(/\s/g, '-')}`}>
                      <TouchableOpacity
                        onPress={() => handleAvatarPress(user.id)}
                        testID={`touchable-avatar-image-${user.id}`}>
                        <Image
                          source={user.avatar || avatar}
                          style={{
                            width: screenWidth / 8,
                            height: screenWidth / 8,
                            borderRadius: screenWidth / 8 / 2,
                          }}
                        />
                      </TouchableOpacity>

                      {nameParts.length >= 2 ? (
                        <View>
                          <TouchableOpacity
                            onPress={() => handleAvatarPress(user.id)}
                            testID={`touchable-avatar-name1-${user.id}`}>
                            <Text
                              style={{
                                textAlign: 'center',
                                fontFamily: 'inter-regular',
                                fontSize: 10,
                              }}>
                              {nameParts[0]}
                            </Text>
                            <Text
                              style={{
                                textAlign: 'center',
                                fontFamily: 'inter-regular',
                                fontSize: 10,
                              }}>
                              {nameParts[1]}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View>
                          <TouchableOpacity
                            onPress={() => handleAvatarPress(user.id)}
                            testID={`touchable-avatar-name-${user.id}`}>
                            <Text
                              style={{
                                textAlign: 'center',
                                fontFamily: 'inter-regular',
                                fontSize: 10,
                              }}>
                              {user.name}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  );
                })}
              </ScrollView>
            </RecentSection>
          )}
        </ContentContainer>
      </PageContainer>
    </ScreenWithHeader>
  );
}
