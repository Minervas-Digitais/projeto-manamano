import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity } from 'react-native';
import PostCard from '../PostCard/PostCard';

interface PostItemProps {
  post: Post;
  formattedDate: string;
  fetchUserName: (userId: string) => Promise<string>;
  fetchNumComments: (postId: string) => Promise<number>;
}

const PostItem: React.FC<PostItemProps> = ({ post, formattedDate, fetchUserName, fetchNumComments }) => {
  const [userName, setUserName] = useState<string>('');
  const [numComments, setNumComments] = useState<number>(post.numComments);

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
      <TouchableOpacity>
        <PostCard
          nameUser={userName}
          postContent={post.input}
          numComments={numComments}
          date={formattedDate}
        />
      </TouchableOpacity>
    </View>
  );
};

export default PostItem;
