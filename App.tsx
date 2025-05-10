// import React from 'react';
// import {GestureHandlerRootView} from 'react-native-gesture-handler';
// import {SafeAreaProvider} from 'react-native-safe-area-context';
// import AppNavigator from './src/navigations/AppNavigator';
// import {NavigationContainer} from '@react-navigation/native';
// import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

// const queryClient = new QueryClient();

// export default function App() {
//   return (
//     <GestureHandlerRootView style={{flex: 1}}>
//       <SafeAreaProvider>
//         <QueryClientProvider client={queryClient}>
//           <NavigationContainer>
//             <AppNavigator />
//           </NavigationContainer>
//         </QueryClientProvider>
//       </SafeAreaProvider>
//     </GestureHandlerRootView>
//   );
// }

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import TraitSelection from './src/screens/Select_mbti/Trait_Selection';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="TraitSelection">
        <Stack.Screen name="TraitSelection" component={TraitSelection} />
        {/* 다른 화면들이 추가될 수 있음 */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
