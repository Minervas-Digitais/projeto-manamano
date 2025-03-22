/* eslint-disable no-console */
/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/jsx-closing-bracket-location */
/* eslint-disable prettier/prettier */
/* eslint-disable global-require */
import React, { useState, useEffect } from 'react';
import { storage } from '../../pages/SignIn/SignIn';
import { useFonts } from 'expo-font';
import { Image, TouchableOpacity, View, StyleSheet, Share, Text } from 'react-native';
import { district } from './ProfileData'; // Adjust the path based on your folder structure
import {
  ProfileContainerButtons,
  ProfileContainerInfo,
  ProfileContainerData,
  ProfileImage,
  ProfileTabsContainer,
  ProfileTextContainer,
  ProfilePostsContainer,
} from './ProfileStyle';
import { HomePageBlue, HomePageWhite } from '../Home/HomeStyle';
import { GroupDataText } from '../GroupData/GroupDataStyle';
import { GroupPageTabs } from '../GroupPage/GroupPageStyle';
import PostCard from '../../components/PostCard/PostCard';
import SideMenu from '../../components/SideMenu/SideMenu';

export default function Profile({ navigation }: any) {
  const [profileId, setProfileId] = useState(1);
  const createDeepLink = () => `manamano://profile/${profileId}`;
  const onShare = async () => {
    const deepLink = createDeepLink();
    try {
      await Share.share({
        message: `Confira este perfil: ${deepLink}`,
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  const [sideMenu, setSideMenu] = useState(true);

  const [fullName, setFullName] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [enterprise, setEnterprise] = useState('');
  const [bio, setBio] = useState('');

  const [myPostsSelect, setMyPostsSelect] = useState(true);
  const [savedPostsSelect, setSavedPostsSelect] = useState(false);
  const [filterPosts, setFilterPosts] = useState('userPosts');

  const duckImage = require('../../assets/duck.png');
  const location = require('../../assets/location-icon.svg');
  const shareWhite = require('../../assets/share-white-icon.svg');
  const menuIcon = require('../../assets/menuWhite-icon.svg');
  const pen = require('../../assets/pen-icon.svg');
  const business = require('../../assets/business-icon.svg');

  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
    'inter-regular': require('../../fonts/Inter-Regular.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }

  // State to store fetched posts
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [savedPosts, setSavedPosts] = useState<any[]>([]);

  useEffect(() => {
    const token = storage.getString('accessToken');
    if (token) {
      const fetchUserData = async () => {
        try {
          const userId = storage.getString('loggedId');
          const response = await fetch(`http://localhost:3000/user/${userId}`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          const data = await response.json();
          // Set fetched user data to state
          setFullName(data.fullName);
          setNeighborhood(data.neighborhood);
          setEnterprise(data.enterprise);
          setBio(data.bio)

          // Fetch user posts
          const fetchUserPosts = async () => {
            try {
              const response = await fetch(`http://localhost:3000/post/${userId}/posts`, {
                method: 'GET',
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              });

              const postData = await response.json();
              setUserPosts(postData); // Store posts in state
            } catch (error) {
              console.error('Error fetching posts:', error);
            }
          };

          // Fetch saved posts
          const fetchSavedPosts = async () => {
            try {
              const response = await fetch(`http://localhost:3000/user/${userId}`, {
                method: 'GET',
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              });

              const data = await response.json();
              const postIds = data.savedPost

              // Create an array of post requests using postIds
              const postRequests = postIds.map(async (postId : any) => {
                const postResponse = await fetch(`http://localhost:3000/post/${postId}`, {
                  method: 'GET',
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                });
                return postResponse.json(); // Return the post data
              });

              // Wait for all post requests to resolve
              const postsData = await Promise.all(postRequests);

              // Once all the posts are fetched, update the state
              setSavedPosts(postsData); 
            } catch (error) {
              console.error('Error fetching saved posts:', error);
            }
          };

          fetchUserPosts();
          fetchSavedPosts();
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };

      fetchUserData();
    }
  }, []); // Empty array means the effect runs only once, similar to componentDidMount

  // Split the fullName to display the first two names
  const fullNameSplit = fullName.split(' ');
  const displayName = fullNameSplit.length > 1 ? `${fullNameSplit[0]} ${fullNameSplit[1]}` : fullName;
  const districtLabel = district.find((item) => item.value === String(neighborhood))?.label || 'Unknown';

  return (
    <HomePageBlue>
      <SideMenu display={sideMenu} onPress={() => setSideMenu(!sideMenu)} />
      <ProfileContainerInfo>
        <ProfileContainerButtons>
          <TouchableOpacity onPress={() => setSideMenu(!sideMenu)}>
            <Image source={menuIcon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onShare}>
            <Image source={shareWhite} />
          </TouchableOpacity>
        </ProfileContainerButtons>
        <ProfileContainerData>
          <ProfileImage radius height="78px" width="78px" source={duckImage} />

          <View style={{ gap: '4px' }}>
            <ProfileContainerData gap={10} center>
              <GroupDataText color="white" size="20px" font="inter-bold">
                {displayName} {/* Display first two names */}
              </GroupDataText>
              <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
                <ProfileImage height="24px" width="24px" radius={false} source={pen} />
              </TouchableOpacity>
            </ProfileContainerData>

            <ProfileContainerData gap={10} center>
              <ProfileImage height="19px" width="19px" radius={false} source={location} />
              <GroupDataText color="white" size="12px" font="inter-regular">
                {districtLabel}
              </GroupDataText>
            </ProfileContainerData>

            <ProfileContainerData gap={10} center>
              <ProfileImage height="19px" width="19px" radius={false} source={business} />
              <GroupDataText color="white" size="12px" font="inter-regular">
                {enterprise}
              </GroupDataText>
            </ProfileContainerData>
          </View>
        </ProfileContainerData>
      </ProfileContainerInfo>
      <HomePageWhite style={{ gap: 0 }}>
        <ProfileTextContainer style={{ padding: '25px 0px 25px 0px' }}>
          <GroupDataText color="#515151" size="12px" font="inter-regular" numberOfLines={3}>
            {bio}
          </GroupDataText>
        </ProfileTextContainer>

        <GroupPageTabs style={style.line}>
          <ProfileTabsContainer
            onPress={() => {
              setMyPostsSelect(true);
              setSavedPostsSelect(false);
              setFilterPosts('userPosts');
            }}
            style={myPostsSelect ? style.selectStyleTab : {}}>
            <GroupDataText font="inter-bold" size="18px" color={myPostsSelect ? '#EF4036' : '#8F8F8F'}>
              Publicações
            </GroupDataText>
          </ProfileTabsContainer>
          <ProfileTabsContainer
            onPress={() => {
              setMyPostsSelect(false);
              setSavedPostsSelect(true);
              setFilterPosts('savedPosts');
            }}
            style={savedPostsSelect ? style.selectStyleTab : {}}>
            <GroupDataText font="inter-bold" size="18px" color={savedPostsSelect ? '#EF4036' : '#8F8F8F'}>
              Salvas
            </GroupDataText>
          </ProfileTabsContainer>
        </GroupPageTabs>
        <ProfilePostsContainer>
          {filterPosts === 'userPosts' ? (
            userPosts?.length > 0 ? (
              userPosts?.map((item: any) => (
                <PostCard
                  key={item.id}
                  nameUser={item.nameUser}
                  imageUser={item.imageUser}
                  postContent={item.postContent}
                  numComments={item.numComments}
                  date={item.date}
                  share
                  postId={item.id}
                />
              ))
            ) : (
              <Text style={[style.noPostsText, { fontFamily: 'inter-regular' }]}>Nenhuma Publicação encontrada</Text>
            )
          ) : savedPosts?.length > 0 ? (
            savedPosts?.map((item: any) => (
              <PostCard
                key={item.id}
                nameUser={item.nameUser}
                imageUser={item.imageUser}
                postContent={item.postContent}
                numComments={item.numComments}
                date={item.date}
                share
                saved
                postId={item.id}
              />
            ))
          ) : (
            <Text style={[style.noPostsText, { fontFamily: 'inter-regular' }]}>Nenhuma Publicação salva</Text>
          )}
        </ProfilePostsContainer>
      </HomePageWhite>
    </HomePageBlue>
  );
}

const style = StyleSheet.create({
  selectStyleTab: {
    borderBottomColor: '#EF4036',
    borderBottomWidth: 2.5,
  },
  line: {
    borderBottomColor: '#D9D9D9',
    borderBottomWidth: 1,
  },
  viewPadding: {
    padding: 25,
  },
  noPostsText: {
    color: '#8F8F8F',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});
