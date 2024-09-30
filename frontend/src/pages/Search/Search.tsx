/* eslint-disable global-require */
import React, { useState } from 'react';
import {
  Image,
  TouchableOpacity,
  View,
  Text,
  TextInput,
  ScrollView,
  Dimensions,
} from 'react-native'; 
import {
  PageContainer,
  SearchHeader,
  Title,
  SearchInputWrapper,
  SearchIcon,
  RecentSection,
  ContentContainer,
  Avatar,
} from './SearchStyle';
import { useFonts } from 'expo-font';
import ResultSection from '../../components/ResultSection/ResultSection'; 

// Interface para definir a estrutura de um usuário
interface User {
  id: number;
  name: string;
  avatar: any;
}

// Lista de usuários recentes com id, nome e avatar
const recentUsers: User[] = [
  { id: 1, name: 'Suzana Souza', avatar: require('../../assets/avatar1.png') },
  { id: 2, name: 'Mariana Fernandes', avatar: require('../../assets/avatar2.png') },
  { id: 3, name: 'Maria Isabela', avatar: require('../../assets/avatar3.png') },
  { id: 4, name: 'Carla Dias', avatar: require('../../assets/nicolasBastos.png') },
  { id: 5, name: 'Lucas Almeida', avatar: require('../../assets/pedroMateus.png') },
  { id: 6, name: 'Suzana', avatar: require('../../assets/avatar1.png') },
  { id: 7, name: 'Mariana Fernandes', avatar: require('../../assets/avatar2.png') },
  { id: 8, name: 'Maria', avatar: require('../../assets/avatar3.png') },
];

// Componente principal da página de busca
export default function Search() {
  // Carregamento dos ícones
  const BackArrow = require('../../assets/back-arrow.svg');
  const Lupa = require('../../assets/lupa-search.svg');

  // Carrega as fontes personalizadas
  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
    'inter-regular': require('../../fonts/Inter-Regular.ttf'),
  });

  // Estado para armazenar o texto da busca
  const [searchText, setSearchText] = useState<string>('');

  // Função chamada ao clicar no avatar
  const handleAvatarPress = (userId: number) => {
    console.log(`Avatar clicked: ${userId}`);
  };

  // Atualiza o texto da busca
  const handleSearchChange = (text: string) => {
    setSearchText(text);
  };

  // Largura da tela do dispositivo
  const screenWidth = Dimensions.get('window').width;

  // Verifica se as fontes estão carregadas
  if (!fontsLoaded) {
    return undefined; // Ou um carregador de sua escolha
  }

  return (
    <PageContainer>
      <SearchHeader>
        <TouchableOpacity>
          <Image source={BackArrow} />
        </TouchableOpacity>
        <Title style={{ fontFamily: 'inter-bold' }}>Pesquisa</Title>
      </SearchHeader>

      <ContentContainer style={{ flex: 1 }}>
        {/* Campo de entrada para busca */}
        <SearchInputWrapper>
          <SearchIcon>
            <Image source={Lupa} />
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
              outline: 'none',
              boxShadow: 'none',
              fontFamily: 'inter-regular', // Aplicando a fonte regular
            }}
          />
        </SearchInputWrapper>

        {/* Exibe ResultSection se houver texto na busca, caso contrário, exibe usuários recentes */}
        {searchText.length > 0 ? (
          <ResultSection />
        ) : (
          <RecentSection>
            <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 10, fontFamily: 'inter-bold', color: '#515151'}}>
              Recentes
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              nestedScrollEnabled={true}
              style={{ flexDirection: 'row', paddingLeft: 10 }}
            >
              {/* Mapeia os usuários recentes para exibir seus avatares e nomes */}
              {recentUsers.map((user) => {
                const nameParts = user.name.split(' '); 
                return (
                  <View key={user.id} style={{ alignItems: 'center', marginRight: 20 }}>
                    <TouchableOpacity onPress={() => handleAvatarPress(user.id)}>
                      <Image
                        source={user.avatar}
                        style={{
                          width: screenWidth / 8,
                          height: screenWidth / 8,
                          borderRadius: screenWidth / 8 / 2, // Faz o avatar ser circular
                        }}
                      />
                    </TouchableOpacity>

                    {/* Divide o nome em partes se houver mais de um nome */}
                    {nameParts.length >= 2 ? (
                      <View>
                        <TouchableOpacity onPress={() => handleAvatarPress(user.id)}>
                          <Text style={{ textAlign: 'center', fontFamily: 'inter-regular', fontSize: 10 }}>{nameParts[0]}</Text>
                          <Text style={{ textAlign: 'center', fontFamily: 'inter-regular', fontSize: 10 }}>{nameParts[1]}</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View>
                        <TouchableOpacity onPress={() => handleAvatarPress(user.id)}>
                          <Text style={{ textAlign: 'center', fontFamily: 'inter-regular', fontSize: 10 }}>{user.name}</Text>
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
