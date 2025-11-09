import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6EDE2',
  },
  // Top Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  topBarCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 12,
  },
  username: {
    fontFamily: 'Exo_700Bold',
    fontSize: 18,
    color: '#000',
    marginBottom: 8,
  },
  productInfoTop: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  productThumbnailTop: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  productTextContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  productNameTop: {
    fontFamily: 'Exo_400Regular',
    fontSize: 13,
    color: '#000',
    marginBottom: 2,
  },
  productPriceTop: {
    fontFamily: 'Exo_700Bold',
    fontSize: 13,
    color: '#000',
  },
  profileButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  // Messages Container
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 100,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-end',
  },
  messageWrapperLeft: {
    justifyContent: 'flex-start',
  },
  messageWrapperRight: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  messageBubbleContainer: {
    maxWidth: '70%',
  },
  messageBubbleContainerLeft: {
    alignItems: 'flex-start',
  },
  messageBubbleContainerRight: {
    alignItems: 'flex-end',
  },
  messageTimestamp: {
    fontFamily: 'Exo_400Regular',
    fontSize: 11,
    color: '#777',
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  messageTimestampLeft: {
    textAlign: 'left',
  },
  messageTimestampRight: {
    textAlign: 'right',
  },
  messageBubble: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  messageBubbleOther: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 4,
  },
  messageBubbleMe: {
    backgroundColor: '#F9F0E5',
    borderTopRightRadius: 4,
  },
  messageText: {
    fontFamily: 'Exo_400Regular',
    fontSize: 15,
    color: '#000',
    lineHeight: 20,
  },
  // Input Bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
    elevation: 8,
  },
  inputIcon: {
    padding: 6,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontFamily: 'Exo_400Regular',
    fontSize: 15,
    color: '#000',
    maxHeight: 100,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  sendButton: {
    padding: 6,
    marginLeft: 8,
  },
});

