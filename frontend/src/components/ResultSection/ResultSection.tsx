import React, { useState } from 'react';
import {
  Avatar,
  Card,
  Container,
  Name,
  Section,
  SectionTitle,
  StyledButton,
} from './ResultSectionStyle';
import { useFonts } from 'expo-font';
import { TouchableOpacity, View, Text, ScrollView, Dimensions } from 'react-native';
import PostCard from '../PostCard/PostCard';

// Dados fictícios para pessoas, grupos e postagens
const people = [
  { id: 1, name: 'Ana Hickmann', avatar: 'https://via.placeholder.com/50' },
  { id: 2, name: 'Ana Maria Braga', avatar: 'https://via.placeholder.com/50' },
  { id: 3, name: 'Ana Clara Lima', avatar: 'https://via.placeholder.com/50' },
];

const groups = [
  { id: 1, name: 'Doceiras Bacanas', avatar: 'https://via.placeholder.com/50' },
  { id: 2, name: 'Análise de Mercado', avatar: 'https://via.placeholder.com/50' },
  { id: 3, name: 'Baianas do ManaMano', avatar: 'https://via.placeholder.com/50' },
];

const posts = [
  { id: 1, name: 'post 1', avatar: 'https://via.placeholder.com/50' },
  { id: 2, name: 'post 2', avatar: 'https://via.placeholder.com/50' },
  { id: 3, name: 'post 3', avatar: 'https://via.placeholder.com/50' },
];

// Componente principal da seção de resultados
export default function ResultSection() {
  const [selectedSection, setSelectedSection] = useState(''); // Controla a seção atualmente visível
  const duckImage = require('../../assets/duck.png'); // Imagem do pato utilizada nos posts

  // Função para alternar entre seções quando um filtro é pressionado
  const handleFilterPress = (section: string) => {
    setSelectedSection(selectedSection === section ? '' : section);
  };

  const screenWidth = Dimensions.get('window').width; // Largura da tela do dispositivo
  const screenHeight = Dimensions.get('window').height; // Altura da tela do dispositivo

  // Carrega as fontes personalizadas
  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
    'inter-regular': require('../../fonts/Inter-Regular.ttf'),
  });

  if (!fontsLoaded) {
    return null; // Retorna null enquanto as fontes não estão carregadas
  }

  // Dados fictícios para posts
  const fakePosts: any = [
    {
      id: 1,
      nameUser: 'Jhennifer Moreira',
      imageUser: duckImage,
      postContent: 'Alguém mora perto de Bonsucesso?',
      numComments: 5,
      date: 'Ontem, 21:32',
      originGroup: 'Vetereanos 22.1',
    },
    {
      id: 2,
      nameUser: 'Juliana Silva',
      imageUser: duckImage,
      postContent: 'Já postaram o link da aula?',
      numComments: 5,
      date: 'Ontem, 21:32',
      originGroup: 'Calouros 23.2',
    },
    {
      id: 3,
      nameUser: 'Jhennifer Moreira',
      imageUser: duckImage,
      postContent: 'Alguém mora perto de Bonsucesso?',
      numComments: 5,
      date: 'Ontem, 21:32',
      originGroup: 'Vetereanos 22.1',
    },
  ];

  return (
    <Container>
      {/* Título da seção de filtros */}
      <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 10, fontFamily: 'inter-bold', color: '#515151', marginTop: 20}}>Filtros</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 10, marginBottom: 10 }}>
        {/* Botão para filtro de Pessoas */}
        <TouchableOpacity
          style={{
            padding: 10,
            backgroundColor: selectedSection === 'Pessoas' ? '#FFA8A6' : '#E0E0E0', // Cor de fundo muda se selecionado
            borderRadius: 30,
            alignContent: 'center',
            width: screenWidth / 3.6,
            height: screenHeight / 28.3,
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
          }}
          onPress={() => handleFilterPress('Pessoas')}
        >
          <Text style={{ fontFamily: 'inter-regular', fontSize: 14 }}>Pessoas</Text>
        </TouchableOpacity>

        {/* Botão para filtro de Grupos */}
        <TouchableOpacity
          style={{
            padding: 10,
            backgroundColor: selectedSection === 'Grupos' ? '#FFA8A6' : '#E0E0E0',
            borderRadius: 30,
            width: screenWidth / 3.6,
            height: screenHeight / 28.3,
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
          }}
          onPress={() => handleFilterPress('Grupos')}
        >
          <Text style={{ fontFamily: 'inter-regular', fontSize: 14 }}>Grupos</Text>
        </TouchableOpacity>

        {/* Botão para filtro de Publicações */}
        <TouchableOpacity
          style={{
            padding: 10,
            backgroundColor: selectedSection === 'Publicações' ? '#FFA8A6' : '#E0E0E0',
            borderRadius: 30,
            alignContent: 'center',
            width: screenWidth / 3.6,
            height: screenHeight / 28.3,
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
          }}
          onPress={() => handleFilterPress('Publicações')}
        >
          <Text style={{ fontFamily: 'inter-regular', fontSize: 14 }}>Publicações</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ height: '100%' }}>
        {/* Seção de Pessoas */}
        {(selectedSection === 'Pessoas' || selectedSection === '') && (
          <Section>
            <SectionTitle style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 10, fontFamily: 'inter-bold', color: '#3F3D3D'}}>Pessoas</SectionTitle>
            {people.map((person) => (
              <Card key={person.id}>
                <TouchableOpacity>
                  <Avatar source={{ uri: person.avatar }} /> {/* Avatar da pessoa */}
                </TouchableOpacity>

                <TouchableOpacity>
                  <Name style={{ fontFamily: 'inter-regular' }}>{person.name}</Name> {/* Nome da pessoa */}
                </TouchableOpacity>
              </Card>
            ))}
            {selectedSection === '' && (
              <StyledButton onPress={() => handleFilterPress('Pessoas')}>
                <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 10, fontFamily: 'inter-bold', color: '#3F3D3D'}}>Ver todos os resultados de pessoas</Text>
              </StyledButton>
            )}
          </Section>
        )}

        {/* Seção de Grupos */}
        {(selectedSection === 'Grupos' || selectedSection === '') && (
          <Section>
            <SectionTitle style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 10, fontFamily: 'inter-bold', color: '#3F3D3D'}}>Grupos</SectionTitle>
            {groups.map((group) => (
              <Card key={group.id}>
                <TouchableOpacity>
                  <Avatar source={{ uri: group.avatar }} /> {/* Avatar do grupo */}
                </TouchableOpacity>

                <TouchableOpacity>
                  <Name style={{ fontFamily: 'inter-regular' }}>{group.name}</Name> {/* Nome do grupo */}
                </TouchableOpacity>
              </Card>
            ))}
            {selectedSection === '' && (
              <StyledButton onPress={() => handleFilterPress('Grupos')}>
                <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 10, fontFamily: 'inter-bold', color: '#3F3D3D'}}>Ver todos os resultados de grupos</Text>
              </StyledButton>
            )}
          </Section>
        )}

        {/* Seção de Publicações */}
        {(selectedSection === 'Publicações' || selectedSection === '') && (
          <Section>
            <SectionTitle style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 10, fontFamily: 'inter-bold', color: '#3F3D3D'}}>Publicações</SectionTitle>
            {fakePosts.map((item: any) => (
              <View style={{marginBottom: 20}} key={item.id}>
                <TouchableOpacity>                
                  <PostCard
                    nameUser={item.nameUser} // Nome do usuário
                    imageUser={item.imageUser} // Imagem do usuário
                    postContent={item.postContent} // Conteúdo da postagem
                    numComments={item.numComments} // Número de comentários
                    date={item.date} // Data da postagem
                    originGroup={item.originGroup} // Grupo de origem da postagem
                  />
                </TouchableOpacity>
                </View>
            ))}
            {selectedSection === '' && (
              <StyledButton onPress={() => handleFilterPress('Publicações')}>
                <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 10, fontFamily: 'inter-bold', color: '#3F3D3D'}}>Ver todos os resultados de publicações</Text>
              </StyledButton>
            )}
          </Section>
        )}
      </ScrollView>
    </Container>
  );
}
