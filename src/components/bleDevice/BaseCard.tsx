import {
  type StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native';

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: 'rgba(60,64,67,0.3)',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    padding: 12,
  },
});

interface BaseCardProps {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  children: React.ReactNode;
}

const BaseCard: React.FC<BaseCardProps> = ({
  onPress,
  style,
  disabled,
  children,
}) => {
  return (
    <View style={style}>
      <TouchableOpacity
        onPress={onPress}
        style={styles.container}
        disabled={disabled}
      >
        {children}
      </TouchableOpacity>
    </View>
  );
};

export default BaseCard;
