/* eslint-disable global-require */
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
import { useFonts } from 'expo-font';
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
import HeaderCustom from '../../components/HeaderCustom/HeaderCustom';
import api from '../../services/api';
import DeleteOneConfirmation from '../../components/DeleteOneConfirmation/DeleteOneConfirmation';

const storage = new MMKV();

interface User {
  id: number;
  name: string;
  avatar: any;
}

export default function Search() {
  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
    'inter-regular': require('../../fonts/Inter-Regular.ttf'),
  });

  const [searchText, setSearchText] = useState<string>('');
  const [debouncedSearchText, setDebouncedSearchText] = useState<string>('');
  const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [loggedIdState, setLoggedIdState] = useState('');
  const [accessTokenState, setAccessTokenState] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const avatar = require('../../assets/duck.png');
  // Fetch recent users from MMKV on mount
  useEffect(() => {
    const storedUsers = storage.getString('recentUsers');
    if (storedUsers) {
      setRecentUsers(JSON.parse(storedUsers));
    }
  }, []);
  useEffect(() => {
    const fetchUserRole = async () => {
      const accessToken = storage.getString('accessToken');
      const loggedId = storage.getString('loggedId');

      if (accessToken && loggedId) {
        setAccessTokenState(accessToken);
        setLoggedIdState(loggedId);

        try {
          const res = await api.get(`/user/${loggedId}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (res.data?.sysRole === 'ADMIN') {
            setIsAdmin(true);
          }
        } catch (error) {
          console.error('Erro ao buscar o usuário:', error);
        }
      }
    };

    fetchUserRole();
  }, []);
  const saveRecentUser = (user: User) => {
    // Check if user already exists in recent users
    const updatedUsers = [user, ...recentUsers.filter((u) => u.id !== user.id)];

    // Enforce a limit of 10 users (FIFO)
    if (updatedUsers.length > 10) {
      updatedUsers.pop();
    }

    // Save to state
    setRecentUsers(updatedUsers);

    // Save to MMKV
    storage.set('recentUsers', JSON.stringify(updatedUsers));
  };

  const handleAvatarPress = (userId: number) => {
    console.log(`Avatar clicked: ${userId}`);
  };

  const screenWidth = Dimensions.get('window').width;

  useEffect(
    () =>
      // Cleanup timeout on unmount
      () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      },
    [timeoutId],
  );

  if (!fontsLoaded) {
    return undefined; // Or a loader of your choice
  }

  const handleSearchChange = (text: string) => {
    setSearchText(text);

    // Clear previous timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Set a new timeout
    const id = setTimeout(() => {
      setDebouncedSearchText(text);

      // Only update debouncedSearchText; no recent user addition here
    }, 2000);
    setTimeoutId(id);
  };

  return (
    <PageContainer>
      <HeaderCustom font="inter-bold" text="Pesquisa" testID="titulo-pesquisa"/>
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

        {debouncedSearchText.length > 0 && accessTokenState ? (
          <ResultSection
            searchText={debouncedSearchText}
            saveRecentUser={saveRecentUser}
            accessToken={accessTokenState}
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
            <ScrollView testID="scroll-recentes" horizontal showsHorizontalScrollIndicator={false} nestedScrollEnabled>
              {recentUsers.map((user) => {
                const nameParts = user.name.split(' ');
                return (
                  <View key={user.id} style={{ alignItems: 'center', marginRight: 20 }} testID={`usuario-${user.name.toLowerCase().replace(/\s/g, '-')}`}>
                    <TouchableOpacity onPress={() => handleAvatarPress(user.id)} testID={`touchable-avatar-image-${user.id}`}>
                      <Image
                        source={avatar}
                        style={{
                          width: screenWidth / 8,
                          height: screenWidth / 8,
                          borderRadius: screenWidth / 8 / 2,
                        }}
                      />
                    </TouchableOpacity>

                    {nameParts.length >= 2 ? (
                      <View>
                        <TouchableOpacity onPress={() => handleAvatarPress(user.id)} testID={`touchable-avatar-name1-${user.id}`}>
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
                        <TouchableOpacity onPress={() => handleAvatarPress(user.id)} testID={`touchable-avatar-name-${user.id}`}>
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
  );
}
