/* eslint-disable global-require */
import React from 'react';
import { useFonts } from 'expo-font';
import { AboutContainer, AboutPage } from './AboutStyle';
import HeaderCustom from '../../components/HeaderCustom/HeaderCustom';
import { GroupDataText } from '../GroupData/GroupDataStyle';
import DevMemberCard from '../../components/DevMemberCard/DevMemberCard';

export default function About() {
  const rayaneDomingosDev = require('../../assets/rayaneDomingos.png');
  const pedroMateusDev = require('../../assets/pedroMateus.png');
  const mellaniePereiraDev = require('../../assets/mellaniePereira.png');
  const nicolasBastosDev = require('../../assets/nicolasBastos.png');
  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
    'inter-semiBold': require('../../fonts/Inter-SemiBold.ttf'),
    'inter-regular': require('../../fonts/Inter-Regular.ttf'),
  });
  if (!fontsLoaded) {
    return undefined;
  }
  const devMembers: any = [
    {
      name: 'Rayane Domingos',
      image: rayaneDomingosDev,
      linkedin: 'https://www.linkedin.com/in/rayane-domingos-082857177/?originalSubdomain=br',
      description: 'Colaborou com a fase de concepção, design e desenvolvimento do aplicativo.',
    },
    {
      name: 'Pedro Mateus',
      image: pedroMateusDev,
      linkedin: 'https://www.linkedin.com/in/ormesino/',
      description: 'Colaborou com a fase de concepção, design e desenvolvimento do aplicativo.',
    },
    {
      name: 'Mellanie Pereira',
      image: mellaniePereiraDev,
      linkedin: 'https://www.linkedin.com/in/mellanie-pereira/',
      description: 'Colaborou com a fase de concepção e design do aplicativo.',
    },

    {
      name: 'Nicolas Bastos',
      image: nicolasBastosDev,
      linkedin: 'https://www.linkedin.com/in/nicolassb/',
      description: 'Colaborou com a fase de desenvolvimento do aplicativo.',
    },
  ];
  return (
    <AboutPage>
      <HeaderCustom font="inter-bold" text="Sobre" onPress={() => {}} />
      <AboutContainer>
        <GroupDataText font="inter-semiBold" color="#160E47" size="18px">
          ManaMano
        </GroupDataText>
        <GroupDataText font="inter-bold" color="#4E4E4E" size="14px">
          O MANAMANO contribui para a formação de nano e microempreendedoras(es) das periferias do
          Rio de Janeiro, criando oportunidades de desenvolvimento de negócios e geração de renda
          para além da crise da Covid-19.
        </GroupDataText>
        <GroupDataText font="inter-semiBold" color="#160E47" size="18px">
          Quem fez
        </GroupDataText>
        {devMembers?.length > 0 ? (
          devMembers?.map((item: any) => (
            <DevMemberCard
              name={item.name}
              image={item.image}
              description={item.description}
              url={item.linkedin}
            />
          ))
        ) : (
          <GroupDataText font="inter-bold" color="#4E4E4E" size="14px">
            Não há membros
          </GroupDataText>
        )}
      </AboutContainer>
    </AboutPage>
  );
}
