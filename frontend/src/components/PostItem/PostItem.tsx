import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import PostCard from '../PostCard/PostCard';

interface PostItemProps {
  post: Post;
  formattedDate: string;
  fetchUserName: (userId: string) => Promise<string>;
  fetchNumComments: (postId: string) => Promise<number>;
}

function PostItem({ post, formattedDate, fetchUserName, fetchNumComments }: PostItemProps) {
  const [userName, setUserName] = useState<string>('');
  const [numComments, setNumComments] = useState<number>(post.numComments);
  const navigation = useNavigation();

  useEffect(() => {
    const loadUserName = async () => {
      const fetchedName = await fetchUserName(post.userId);
      setUserName(fetchedName);
    };
    loadUserName();
  }, [post.userId, fetchUserName]);

  useEffect(() => {
    const loadNumComments = async () => {
      const commentsCount = await fetchNumComments(post.id);
      setNumComments(commentsCount);
    };
    loadNumComments();
  }, [post.id, fetchNumComments]);

  return (
    <View style={{ marginBottom: 20 }}>
      <PostCard
        nameUser={userName}
        postContent={post.input}
        numComments={numComments}
        date={formattedDate}
        onPressPost={() => {
          navigation.navigate('Post', { postId: post.id });
        }}
      />
    </View>
  );
}

export default PostItem;
