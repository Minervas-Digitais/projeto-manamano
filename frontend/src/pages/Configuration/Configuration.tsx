import React from 'react';
import { View } from 'react-native';
import SideMenuOptions from '../../components/SideMenuOptions/SideMenuOptions';

export default function Config({navigation}){
    const notification = require('../../assets/notification-licon.svg');
    const lock = require('../../assets/lock-licon.svg');
    const about = require('../../assets/about-icon.svg');
    return(
    <View style={{backgroundColor: "#F2F6FA", flex:1,}}>
        <View style={{gap: 25, backgroundColor: "#F2F6FA", marginLeft: 25, marginTop: 30,}}>
            <SideMenuOptions icon={notification} text="Notificações" font="inter-bold"/>
            <SideMenuOptions icon={about} text="Sobre" font="inter-bold"/>
            <SideMenuOptions icon={lock} text="Mudar senha" font="inter-bold"/>
        </View>
    </View>
    )
}