import SingleInputAutocomplete, {
    SingleInputAutocompleteProps,
} from 'components/SingleInputAutocomplete';
import { GalleryContext } from 'pages/gallery';
import React, { useContext, useState, useEffect } from 'react';
import { t } from 'i18next';
import { shareCollection } from 'services/collectionService';
import { User } from 'types/user';
import { handleSharingErrors } from 'utils/error/ui';
import { getData, LS_KEYS } from 'utils/storage/localStorage';
import { CollectionShareSharees } from './sharees';
import { getLocalCollections } from 'services/collectionService';

export default function EmailShare({ collection }) {
    const galleryContext = useContext(GalleryContext);

    const [updatedOptionsList, setUpdatedOptionsList] = useState(['']);
    let updatedList = [];
    useEffect(() => {
        const getUpdatedOptionsList = async () => {
            const ownerUser: User = getData(LS_KEYS.USER);
            const collection_list = getLocalCollections();
            const result = await collection_list;
            const emails = result.flatMap((item) => {
                const shareeEmails = item.sharees.map((sharee) => sharee.email);
                if (item.owner.email) {
                    return [...shareeEmails, item.owner.email];
                } else {
                    return shareeEmails;
                }
            });

            updatedList = Array.from(new Set(emails));

            const shareeEmailsCollection = collection.sharees.map(
                (sharees) => sharees.email
            );
            const filteredList = updatedList.filter(
                (email) =>
                    !shareeEmailsCollection.includes(email) &&
                    email !== ownerUser.email
            );

            setUpdatedOptionsList(filteredList);
        };

        getUpdatedOptionsList();
    }, []);

    const collectionShare: SingleInputAutocompleteProps['callback'] = async (
        email,
        setFieldError,
        resetForm
    ) => {
        try {
            const user: User = getData(LS_KEYS.USER);
            if (email === user.email) {
                setFieldError(t('SHARE_WITH_SELF'));
            } else if (
                collection?.sharees?.find((value) => value.email === email)
            ) {
                setFieldError(t('ALREADY_SHARED', { email }));
            } else {
                await shareCollection(collection, email);
                await galleryContext.syncWithRemote(false, true);
                resetForm();
            }
        } catch (e) {
            const errorMessage = handleSharingErrors(e);
            setFieldError(errorMessage);
        }
    };
    return (
        <>
            <SingleInputAutocomplete
                callback={collectionShare}
                optionsList={updatedOptionsList}
                placeholder={t('ENTER_EMAIL')}
                fieldType="email"
                buttonText={t('SHARE')}
                submitButtonProps={{
                    size: 'medium',
                    sx: { mt: 1, mb: 2 },
                }}
                disableAutoFocus
            />
            <CollectionShareSharees collection={collection} />
        </>
    );
}
