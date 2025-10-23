import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import PostCard from '../PostCard/PostCard';
import { RootStackParamList } from '../../navigation/types';

interface PostWithData {
  id: string;
  userId: string;
  groupId: string;
  input: string; // ou postContent
  createdAt: string;
  user: {
    fullName: string;
  };
  _count: {
    Comment: number;
  };

  nameUser: string;
  numComments: number;
}

interface PostItemProps {
  post: PostWithData, //Post;
  formattedDate: string;
  testID?: string;
}

function PostItem({ post, formattedDate, testID }: PostItemProps) {
  const navigation = useNavigation<NavigationProp<RootStackParamList, 'Post'>>();

  return (
    <View testID={testID} style={{ marginBottom: 20 }}>
      <PostCard
        nameUser={post.nameUser}
        postContent={post.input}
        numComments={post.numComments}
        date={formattedDate}
        onPressPost={() => {
          navigation.navigate('Post', { postId: post.id });
        }}
      />
    </View>
  );
}

export default PostItem;
