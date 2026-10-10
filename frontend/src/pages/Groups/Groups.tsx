/* eslint-disable global-require */
import React, { useEffect, useState } from 'react';
import { RefreshControl, TouchableOpacity, Text } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { GroupsBody, GroupsContainer, GroupsList } from './GroupsStyle';
import GroupButton from '../../components/GroupButton/GroupButton';
import AddButton from '../../components/AddButton/AddButton';
import ShowPopup from '../../components/GroupPopup/GroupPopup';
import api from '../../services/api';
import Add from '../../assets/add-icon.svg';
import { RootStackParamList } from '../../navigation/types';
import ScreenWithHeader from '../../components/ScreenWithHeader/ScreenWithHeader';
import { useAuth } from '../../context/auth/useAuth';
import useFetch from '../../hooks/useFetch';
import LoadingState from '../../components/LoadingState/LoadingState';
import EmptyState from '../../components/EmptyState/EmptyState';
import ErrorState from '../../components/ErrorState/ErrorState';
import StaleDataBanner from '../../components/StaleDataBanner/StaleDataBanner';

export default function Groups() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>(); // Use navigation instance
  const { loggedId } = useAuth();

  const [showPopup, setShowPopup] = useState(false);
  const [page, setPage] = useState(1);
  const GROUPS_PER_PAGE = 10;

  const groupsQuery = useFetch<any[]>(
    async () => {
      const res = await api.get('participant/groups/');
      const data = res.data?.data ?? res.data;
      return Array.isArray(data) ? data : [];
    },
    [loggedId],
    { enabled: !!loggedId },
  );

  // Falha aqui só afeta a permissão do botão de adicionar
  const userQuery = useFetch<any>(
    async () => (await api.get(`/user/${loggedId}`)).data,
    [loggedId],
    {
      enabled: !!loggedId,
    },
  );

  const groups = groupsQuery.data ?? [];
  const displayedGroups = groups.slice(0, page * GROUPS_PER_PAGE);
  const hasMoreGroups = displayedGroups.length < groups.length;

  useEffect(() => {
    setPage(1);
  }, [groupsQuery.data]);

  const handleAddButtonPress = () => {
    const userData = userQuery.data;
    // Check if user has permission: role INSTRUCTOR or sysRole MODERATOR or ADMIN
    const hasPermission =
      userData?.role === 'INSTRUCTOR' ||
      userData?.sysRole === 'MODERATOR' ||
      userData?.sysRole === 'ADMIN';

    if (!userData || !hasPermission) {
      navigation.navigate('EntrarGrupo');
      return;
    }

    setShowPopup(true);
  };

  const handlePopupOption = (option: string) => {
    setShowPopup(false); // Close the popup after an option is selected
    if (option === 'Criar Grupo') {
      // Navigate to "CreateGroup" screen
      navigation.navigate('CreateGroup');
    } else if (option === 'Entrar Grupo') {
      // Navigate to "EntrarGrupo" screen ONLY after the user clicks the button
      navigation.navigate('EntrarGrupo');
    }
  };

  const renderContent = () => {
    if (groupsQuery.loading) {
      return <LoadingState text="Carregando grupos..." />;
    }

    if (groupsQuery.error && groupsQuery.data === undefined) {
      return (
        <ErrorState text="Não foi possível carregar seus grupos." onRetry={groupsQuery.refetch} />
      );
    }

    if (groups.length === 0) {
      return <EmptyState text="Você ainda não participa de nenhum grupo." />;
    }

    return (
      <>
        {groupsQuery.stale && (
          <StaleDataBanner
            refreshing={groupsQuery.refreshing}
            onRefresh={() => groupsQuery.refresh()}
            style={{ marginLeft: 0, marginRight: 0, marginTop: 0, marginBottom: 25 }}
          />
        )}
        <GroupsList
          contentContainerStyle={{ gap: 25, alignItems: 'center', paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={groupsQuery.refreshing}
              onRefresh={() => groupsQuery.refresh()}
              colors={['#EF4036']}
              tintColor="#EF4036"
            />
          }>
          {displayedGroups.map((item: any) => (
            <GroupButton
              key={item.groupId}
              groupName={item.group.name}
              onlineMembers={item.participantCount}
              onPress={() => {
                navigation.navigate('GroupPage', {
                  groupId: item.groupId,
                  groupName: item.group.name,
                });
              }}
              showFilter={false}
              containerStyle={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                backgroundColor: '#f2f6fa',
              }}
            />
          ))}
          {hasMoreGroups && (
            <TouchableOpacity
              onPress={() => setPage((p) => p + 1)}
              style={{
                backgroundColor: '#EF4036',
                padding: 12,
                borderRadius: 8,
                marginTop: 16,
                width: '100%',
                alignItems: 'center',
              }}>
              <Text style={{ color: '#fff', fontFamily: 'inter-bold' }}>Carregar mais</Text>
            </TouchableOpacity>
          )}
        </GroupsList>
      </>
    );
  };

  return (
    <ScreenWithHeader headerProps={{ menu: true, text: 'Grupos', font: 'inter-bold' }}>
      <GroupsContainer>
        <GroupsBody>{renderContent()}</GroupsBody>
        {!(groupsQuery.error && groupsQuery.data === undefined) && (
          <AddButton testID="add-button" icon={<Add />} onPress={handleAddButtonPress} />
        )}
        <ShowPopup
          visible={showPopup}
          onClose={() => setShowPopup(false)}
          onOptionSelect={handlePopupOption}
        />
      </GroupsContainer>
    </ScreenWithHeader>
  );
}
